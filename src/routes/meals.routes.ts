import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { request } from 'http'

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
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const meals = await knex('meals').returning('*')

      return reply.send({ meals })
    }
  )

  app.get(
    '/:mealId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      if(!meal) {
        return reply.status(401).send({ error: 'Meal not found' })
      }

      return reply.send({ meal })
    }
  )

  app.put(
    '/mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() })

      const { mealId } =  paramsSchema.parse(request.params)

      const updateMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date()
      })

      const { name, description, isOnDiet, date } = updateMealsBodySchema.parse(request.body)

      const meal = await knex('meals').where({ id: mealId }).first()

      if(!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id: mealId }).update({
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime()
      })

      return reply.status(204).send()
    }
  )
}