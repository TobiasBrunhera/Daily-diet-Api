import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
        user_id: request.user?.id,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    async (request, reply) => {
      try {
        // Verifica se o ID do usuário está presente na solicitação
        if (!request.user?.id) {
          return reply.status(401).send({ message: 'Unauthorized' });
        }

        // Busca as refeições do usuário no banco de dados
        const meals = await knex('meals').where({ user_id: request.user.id }).orderBy('date', 'desc');
        return reply.send({ meals });
      } catch (error) {
        return reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  );
}