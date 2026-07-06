import chalk from 'chalk'
import { createServer } from 'http'
import { readFileSync, statSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
}

export function registerServe(program) {
  program
    .command('serve')
    .description('在当前目录启动 HTTP 文件服务器')
    .argument('[port]', '端口号', '8080')
    .option('-d, --dir <path>', '根目录', '.')
    .option('--cors', '允许跨域')
    .action((port, opts) => {
      port = parseInt(port) || 8080
      const root = join(process.cwd(), opts.dir)
      const server = createServer((req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        let path = join(root, url.pathname)
        if (!existsSync(path)) {
          res.writeHead(404)
          res.end('404 Not Found')
          return
        }
        const stat = statSync(path)
        if (stat.isDirectory()) {
          path = join(path, 'index.html')
          if (!existsSync(path)) {
            const files = require('fs').readdirSync(path)
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end('<ul>' + files.map(f => `<li><a href="${url.pathname}/${f}">${f}</a></li>`).join('') + '</ul>')
            return
          }
        }
        const ext = extname(path).toLowerCase()
        const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' }
        if (opts.cors) headers['Access-Control-Allow-Origin'] = '*'
        res.writeHead(200, headers)
        res.end(readFileSync(path))
      })
      server.listen(port, () => {
        console.log(chalk.bold('\n📁 文件服务器已启动'))
        console.log(`  Local:   ${chalk.cyan(`http://localhost:${port}`)}`)
        console.log(chalk.gray('  按 Ctrl+C 停止'))
        console.log()
      })
    })
}
