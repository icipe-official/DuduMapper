// // pages/api/proxy.ts
// import type { NextApiRequest, NextApiResponse } from 'next'
// import httpProxy from 'http-proxy'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// const proxy = httpProxy.createProxyServer()

// export default (req: NextApiRequest, res: NextApiResponse) => {
//   req.url = req.url?.replace(/^\/api\/proxy/, '') || ''
//   proxy.web(req, res, {
//     target: 'https://test-dmmg.icipe.org',
//     changeOrigin: true,
//     secure: false,
//   })
// }
