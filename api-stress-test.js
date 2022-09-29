async function main () {
    const url = (process.env.PROTOCOL || 'http') + '://' + (process.env.HOST || 'localhost') + ':' + (process.env.PORT || '8080') + '/sessions'
    // const url = (process.env.PROTOCOL || 'http') + '://' + (process.env.HOST || 'localhost') + '/sessions'
    console.log('fetching from url:', url)

    let counter = 0
    setInterval(async () => {
        counter++
        const response = await fetch (url + '?count=' + counter, { method: 'GET' })
        if (response.statusText === 'OK') {
            const result = await response.json()
            console.log(counter, 'count:', result.length)
        } else {
            console.error('ERROR: ' + response.status + ' ' + response.statusText)
        }
    }, 3)
    // }, 1000)
}
main()
