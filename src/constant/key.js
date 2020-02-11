import axios from 'axios'
export const APP_KEY = 'OOG2mZu8Mupu9iomRH0yrzX0'
export const APP_SECRET = 'KCu7ByD3R2ik2aPhahdZI2eqEOXoREye'
const Token = '24.17777a1a74c5a95300c56465b508e2c5.2592000.1584016358.282335-10060819'
export async function getVoice (text) {
  // const baidukey = localStorage.getItem('baidukey')
  const param = {
    lan: 'zh',
    ctp: 2,
    tex: encodeURIComponent(encodeURIComponent(text)),
    cuid: generateUUID(),
    spd: 6,
    pit: 5,
    per: 1,
    vol: 15,
    // 目前没办法 因为没有云服务器 只能写死 好在有效期是30天
    tok: Token
  }
  const result = await axios({
    responseType: 'blob',
    url: 'http://tsn.baidu.com/text2audio' + getParamsUrl(param)
  })
  return URL.createObjectURL(new Blob([result.data]))
}
export function initBaidu () {
  const baidukey = localStorage.getItem('baidukey')
  const baidustamp = localStorage.getItem('baidustamp')
  if (baidukey && baidustamp) {
    //   存在key
    const overDate = Date.now() - parseInt(baidustamp) // 最大时间
    if ((overDate / 1000 / 3600 / 24) < 30) {
      // 如果在token在三十天有效期之内 就可以继续使用
      return false
    }
  }

  const param = {
    grant_type: 'client_credentials',
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  axios(
    'https://aip.baidubce.com/oauth/2.0/token' + getParamsUrl(param)
    , function (err, data) {
      if (err) return false
      localStorage.setItem('baidukey', data.access_token)
      localStorage.setItem('baidustamp', Date.now())
    }
  )
}

function generateUUID () {
  var d = new Date().getTime()
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}
function getParamsUrl (param) {
  if (param && Object.keys(param).length) {
    return '?' + Object.keys(param).map(key => key + '=' + param[key]).join('&')
  }
  return ''
}
