// 搜索引擎注册表
import baidu from './baidu.js'
import bing from './bing.js'
import duckduckgo from './duckduckgo.js'
import brave from './brave.js'
import yandex from './yandex.js'
import github from './github.js'
import npm from './npm.js'
import pypi from './pypi.js'
import arxiv from './arxiv.js'
import wikipedia from './wikipedia.js'
import moegirl from './moegirl.js'
import bilibili from './bilibili.js'
import zhihu from './zhihu.js'
import weibo from './weibo.js'
import douyin from './douyin.js'
import toutiao from './toutiao.js'
import xinhua from './xinhua.js'
import cctv from './cctv.js'
import thepaper from './thepaper.js'
import kr36 from './kr36.js'
import huxiu from './huxiu.js'
import ithome from './ithome.js'
import cls from './cls.js'
import douban from './douban.js'
import imdb from './imdb.js'
import baidubaike from './baidubaike.js'
import taobao from './taobao.js'
import jd from './jd.js'
import pdd from './pdd.js'
import tavily from './tavily.js'
import exa from './exa.js'
import stackoverflow from './stackoverflow.js'
import semanticscholar from './semanticscholar.js'
import googlescholar from './googlescholar.js'
import google from './google.js'
import anysearch from './anysearch.js'
import searx from './searx.js'
import wolfram from './wolfram.js'
import reddit from './reddit.js'
import hackernews from './hackernews.js'
import crates from './crates.js'
import gopkg from './gopkg.js'

export const engines = {
  anysearch,
  baidu,
  searx,
  wolfram,
  reddit,
  hackernews,
  crates,
  gopkg,
  bing,
  duckduckgo,
  brave,
  yandex,
  google,
  github,
  npm,
  pypi,
  arxiv,
  wikipedia,
  moegirl,
  bilibili,
  zhihu,
  weibo,
  douyin,
  toutiao,
  xinhua,
  cctv,
  thepaper,
  kr36,
  huxiu,
  ithome,
  cls,
  douban,
  imdb,
  baidubaike,
  taobao,
  jd,
  pdd,
  tavily,
  exa,
  stackoverflow,
  semanticscholar,
  googlescholar,
}

export function getEngine(name) {
  const engine = engines[name.toLowerCase()]
  if (!engine) {
    const available = Object.keys(engines).join(', ')
    throw new Error(`未知搜索源 "${name}"。可用搜索源：${available}`)
  }
  return engine
}

export function listEngines() {
  return Object.values(engines).map(e => ({
    name: e.name,
    description: e.description,
    requiresKey: e.requiresKey || false,
    requiresCookie: e.requiresCookie || false,
    stability: e.stability || 'stable',
  }))
}
