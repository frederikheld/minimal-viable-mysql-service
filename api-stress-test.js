async function main () {
    if (!process.env.PORT) {
        console.log('process.env.PORT not set. Please set the environment variable and try again!')
        return
    }

    let counter = 0
    setInterval(async () => {
        counter++
        const rawResult = await fetch ('http://localhost:' + process.env.PORT + '/sessions?count=' + counter)
        const result = await rawResult.json()
        console.log(counter, 'count:', result.length)
    }, 7)
}
main()