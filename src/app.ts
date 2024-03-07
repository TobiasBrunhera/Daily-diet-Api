import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/users.routes'
import { mealsRoutes } from './routes/meals.routes'

export const app = fastify()

app.register(cookie)

app.register(userRoutes, { prefix: 'users' })
app.register(mealsRoutes, { prefix: 'meals' })