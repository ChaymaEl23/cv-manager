import api from '../services/api'

const getFileName = (contentDisposition) => {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/)
  return match?.[1] || 'cv-manager.pdf'
}

export async function downloadCvPdf() {
  const response = await api.get('/ai/cv-pdf', { responseType: 'blob' })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = getFileName(response.headers['content-disposition'])
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
