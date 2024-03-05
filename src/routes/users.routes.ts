import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function userRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
      const createUserBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
  
      let sessionId = request.cookies.sessionId;
  
      if (!sessionId) {
        sessionId = randomUUID();
  
        reply.setCookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 24 * 7, // 7 Days
        });
      }
  
      const { name, email } = createUserBodySchema.parse(request.body);
  
      const userByEmail = await knex('users').where({ email }).first();
  
      if (userByEmail) {
        return reply.status(400).send({ message: 'User already exists' });
      }
  
      const userId = randomUUID(); // Gera um novo ID de usuário
      const userResult = await knex('users').insert({
        id: userId,
        name,
        email,
        session_id: sessionId,
      }).returning('*')
  
      return reply.status(201).send({ userResult }); // Retorna o ID do usuário criado
    });
  }