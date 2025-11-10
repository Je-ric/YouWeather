import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    base: '/YouWeather/', 
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
})
