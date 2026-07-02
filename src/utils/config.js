import Conf from 'conf'

let _conf = null

export function getConfig() {
  if (!_conf) {
    _conf = new Conf({ projectName: 'fengling-box' })
  }
  return _conf
}
