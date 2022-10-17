import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import path from 'path'

// set environment variables
// following the rules specified at:
//    https://create-react-app.dev/docs/adding-custom-environment-variables/
switch (process.env.NODE_ENV) {
    case 'development':
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.development.local'),
        })
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.local'),
        })
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.development'),
        })
        break
    case 'test':
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.test.local'),
        })
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.test'),
        })
        break
    case 'production':
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.production.local'),
        })
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.local'),
        })
        dotenv.config({
            path: path.resolve(process.cwd(), '.env.production'),
        })
        break
}
var env = dotenv.config()
dotenvExpand.expand(env)
