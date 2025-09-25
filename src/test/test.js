const autocannon= require('autocannon')

autocannon(
  {
    url: 'http://localhost:4000',
    connections: 1,
    pipelining: 1,
    duration: 30
  },
  console.log // callback when finished
)

// async wrapper example
async function foo() {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: 'http://localhost:4000',
        connections: 1,
        pipelining: 1,
        duration: 10
      },
      (err, result) => {
        if (err) reject(err)
        else resolve(result)
      }
    )

    // you can also listen to progress events
    autocannon.track(instance)
  })
}

foo().then(res => {
  console.log('Finished benchmark:', res)
})
