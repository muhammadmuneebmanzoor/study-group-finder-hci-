import express from 'express';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  app.use(express.json());
  app.use(cookieParser());

  // --- API ROUTES ---

  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      (req as any).userId = decoded.userId;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: 'Email already exists' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword }
      });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: (req as any).userId },
        select: { id: true, name: true, email: true, bio: true, department: true, semester: true }
      });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
      const { name, bio, university, department, semester } = req.body;
      const user = await prisma.user.update({
        where: { id: (req as any).userId },
        data: { name, bio, university, department, semester },
        select: { id: true, name: true, email: true, bio: true, university: true, department: true, semester: true }
      });
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Group Routes
  app.get('/api/groups', authMiddleware, async (req, res) => {
    try {
      const search = (req.query.search as string) || '';
      const filter = (req.query.filter as string) || 'all';
      const meetingType = (req.query.meetingType as string) || 'all';
      const semester = (req.query.semester as string) || 'all';
      const userId = (req as any).userId;

      let whereClause: any = { AND: [] };

      if (search) {
        whereClause.AND.push({
          OR: [
            { title: { contains: search } },
            { subject: { contains: search } },
            { department: { contains: search } },
            { university: { contains: search } },
            { tags: { contains: search } }
          ]
        });
      }

      if (meetingType !== 'all') {
        whereClause.AND.push({ meetingType });
      }

      if (semester !== 'all') {
        whereClause.AND.push({ semester });
      }

      if (filter === 'my-groups' && userId) {
        whereClause.AND.push({
          members: {
            some: { userId }
          }
        });
      }

      const finalWhere = whereClause.AND.length > 0 ? whereClause : {};

      const groups = await prisma.studyGroup.findMany({
        where: finalWhere,
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          },
          _count: { select: { members: true } }
        },
        orderBy: filter === 'trending' ? {
          members: { _count: 'desc' }
        } : {
          createdAt: 'desc'
        }
      });
      res.json(groups);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  });

  app.post('/api/groups', authMiddleware, async (req, res) => {
    try {
      const { title, description, subject, department, semester, university, capacity, meetingType, privacy, tags } = req.body;
      const ownerId = (req as any).userId;
      
      const group = await prisma.studyGroup.create({
        data: {
          title, 
          description, 
          subject, 
          department,
          semester,
          university,
          capacity: parseInt(capacity), 
          meetingType: meetingType || 'online',
          privacy: privacy || 'public',
          tags,
          ownerId,
          members: {
            create: { userId: ownerId, role: 'ADMIN' }
          }
        }
      });
      res.json(group);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create group' });
    }
  });

  app.get('/api/groups/:id', authMiddleware, async (req, res) => {
    try {
      const group = await prisma.studyGroup.findUnique({
        where: { id: req.params.id },
        include: { members: { include: { user: { select: { id: true, name: true } } } } }
      });
      if (!group) return res.status(404).json({ error: 'Not found' });
      res.json(group);
    } catch (err) {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  app.post('/api/groups/:id/join', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      
      const exMembership = await prisma.groupMember.findFirst({ where: { groupId: id, userId } });
      if (exMembership) return res.status(400).json({ error: 'Already a member' });

      await prisma.groupMember.create({ data: { groupId: id, userId } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to join group ' });
    }
  });

  app.post('/api/groups/:id/leave', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      
      const membership = await prisma.groupMember.findFirst({ where: { groupId: id, userId } });
      if (!membership) return res.status(400).json({ error: 'Not a member' });

      if (membership.role === 'ADMIN') {
        const count = await prisma.groupMember.count({ where: { groupId: id, role: 'ADMIN' }});
        if (count === 1) {
          return res.status(400).json({ error: 'Cannot leave as the only admin.' });
        }
      }

      await prisma.groupMember.delete({ where: { id: membership.id } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to leave group ' });
    }
  });
  
  // Real-time Chat details
  app.get('/api/groups/:id/messages', authMiddleware, async (req, res) => {
    try {
      const messages = await prisma.message.findMany({
        where: { groupId: req.params.id },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' }
      });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });


  // --- SESSIONS ROUTES ---
  app.get('/api/sessions', authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const sessions = await prisma.session.findMany({
        where: {
          group: {
            members: { some: { userId } }
          }
        },
        include: { group: { select: { id: true, title: true } }, participants: true },
        orderBy: { startTime: 'asc' }
      });
      res.json(sessions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });

  app.post('/api/sessions', authMiddleware, async (req, res) => {
    try {
      const { groupId, title, startTime, endTime, meetingLink } = req.body;
      const session = await prisma.session.create({
        data: { groupId, title, startTime: new Date(startTime), endTime: new Date(endTime), meetingLink }
      });
      
      const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
        include: { members: true }
      });
      
      const userId = (req as any).userId;
      if (group) {
        const notifications = group.members
          .filter(m => m.userId !== userId)
          .map(m => ({
            userId: m.userId,
            title: `New Session: ${session.title}`,
            content: `A new session has been scheduled in ${group.title}.`,
            type: 'INFO'
          }));
        
        if (notifications.length > 0) {
          await prisma.notification.createMany({
            data: notifications
          });
        }
      }

      res.json(session);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  app.delete('/api/sessions/:id', authMiddleware, async (req, res) => {
    try {
      await prisma.session.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete session' });
    }
  });

  // --- NOTIFICATIONS ROUTES ---
  app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
      const notif = await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true }
      });
      res.json(notif);
    } catch (err) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // --- FRIENDS ROUTES ---
  app.get('/api/friends', authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const friends = await prisma.friendConnection.findMany({
        where: { OR: [{ initiatorId: userId }, { receiverId: userId }], status: 'ACCEPTED' },
        include: { initiator: true, receiver: true }
      });
      res.json(friends);
    } catch(err) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  app.post('/api/friends/invite', authMiddleware, async (req, res) => {
    try {
      // just generate a link
      const userId = (req as any).userId;
      // You can store an invite token if needed, or just return standard url
      res.json({ link: `https://${req.get('host')}/register?ref=${userId}` });
    } catch(err) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // --- RATINGS ROUTES ---
  app.get('/api/groups/:id/ratings', authMiddleware, async (req, res) => {
    try {
      const ratings = await prisma.groupRating.findMany({
        where: { groupId: req.params.id },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(ratings);
    } catch(err) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  app.post('/api/groups/:id/ratings', authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { rating, review } = req.body;
      const data = await prisma.groupRating.upsert({
        where: { userId_groupId: { userId, groupId: req.params.id } },
        update: { rating, review },
        create: { userId, groupId: req.params.id, rating, review }
      });
      res.json(data);
    } catch(err) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // --- WEBSOCKETS ---
  io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
    });
    
    socket.on('sendMessage', async (data) => {
      const { groupId, userId, content } = data;
      try {
        const msg = await prisma.message.create({
          data: { groupId, userId, content },
          include: { user: { select: { id: true, name: true } } }
        });
        io.to(groupId).emit('newMessage', msg);
        
        const group = await prisma.studyGroup.findUnique({
          where: { id: groupId },
          include: { members: true }
        });
        
        if (group) {
          const notifications = group.members
            .filter(m => m.userId !== userId)
            .map(m => ({
              userId: m.userId,
              title: `New Message in ${group.title}`,
              content: `${msg.user.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
              type: 'INFO'
            }));
          
          if (notifications.length > 0) {
            await prisma.notification.createMany({
              data: notifications
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
