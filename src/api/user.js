import request from '../utils/request'
export async function getToken () {
  const data = await request({
    url: '/authorizations',
    method: 'post',
    data: {
      mobile: '13041139705',
      code: '246810'
    }
  })
  localStorage.setItem('gToken', data.token)
  localStorage.setItem('myTime', Date.now())
  return {}
}
// 读取文章内容
export async function getContent () {
  if (!localStorage.getItem('gToken')) {
    await getToken()
  } else {
    let time = localStorage.getItem('myTime')
    if (time) {
      time = parseInt(time)
    } else {
      time = new Date('2018-01-01').getTime()
    }
    if (((Date.now() - time) / 1000 / 3600) > 1.5) {
      await getToken()
    }
  }
  return request({
    url: '/articles/1226184558450311168'
  })
}
// 读取文章内容
export function setContent (content) {
  return request({
    url: '/articles/1226184558450311168',
    method: 'put',
    data: {
      title: '老高的点歌平台',
      channel_id: 4,
      imgType: 'none',
      content,
      cover: { type: 0, images: [] }
    }, // 请求体参数
    params: { draft: true } // 查询参数
  })
}
