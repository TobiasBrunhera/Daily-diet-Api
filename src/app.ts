import fastify from 'fastify'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)