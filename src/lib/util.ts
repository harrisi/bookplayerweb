const formatTime = (n: number) => {
  const hours = Math.floor(n / 3600),
    minutes = Math.floor((n % 3600) / 60),
    seconds = Math.floor(n % 60),
    parts = []

  if (hours > 0) parts.push(String(hours).padStart(2, '0'))
  parts.push(String(minutes).padStart(2, '0'))
  parts.push(String(seconds).padStart(2, '0'))

  return parts.join(':')
}

export {
  formatTime,
}