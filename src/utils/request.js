import axios from 'axios'
import JSONBig from 'json-bigint'
const instance = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/mp/v1_0',
  transformResponse: [function (data) {
    //  当后台 响应的字符串 回到axios请求时 就会触发
    //  data是一个字符串  把字符串转化成 对象并且返回 默认的是JSON.parse()
    // 如果data是一个空字符串  直接转化就会报错
    // return data ? JSONBig.parse(data) : {}
    try {
      return JSONBig.parse(data)
    } catch (error) {
      return data // 如果失败 就把字符串直接返回
    }
  }]
})
instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem('gToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}` // 统一注入token
  }
  return config
})
instance.interceptors.response.use(function (result) {
  return result.data.data
}, async function (error) {
  if (error.response.code === 401) {
    const result = await axios({
      url: '/authorizations',
      method: 'post',
      data: {
        mobile: '13041139705',
        code: '246810'
      }
    })
    localStorage.setItem('gToken', result.data.data.token)
    return instance(error.config)
  }
})
export default instance
