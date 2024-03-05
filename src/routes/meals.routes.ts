import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      });

      try {
        const { name, description, isOnDiet, date } = createMealBodySchema.parse(request.body);

        // Verifica se o ID do usuário está presente na solicitação
        if (!request.user?.id) {
          return reply.status(401).send({ message: 'Unauthorized' });
        }

        console.log(createMealBodySchema)

        // Verifica se já existe uma refeição para o usuário
        const verifyMeal = await knex('meals').where({ user_id: request.user.id }).first();
        if (verifyMeal) {
          return reply.status(400).send({ message: 'User already has a meal' });
        }

        // Insere a refeição no banco de dados
        const meal = {
          id: randomUUID(),
          name,
          description,
          is_on_diet: isOnDiet,
          date: date.getTime(),
          user_id: request.user.id,
        };

        const insertedMeal = await knex('meals').insert(meal).returning('*');
        return reply.status(201).send(insertedMeal);
      } catch (error) {
        return reply.status(400).send();
      }
    }
  );

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