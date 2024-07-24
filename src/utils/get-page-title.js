import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Patent Collection'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
