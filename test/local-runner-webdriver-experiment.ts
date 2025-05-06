import 'dotenv/config'
import { handler } from '../src/lambdas/webdriver-state-experiment'

console.log('Using AWS profile:', process.env.AWS_PROFILE)

// Run the handler
handler({})
  .then(result => {
    console.log(result)
    console.log('Lambda completed successfully')
  })
  .catch(err => {
    console.error('Lambda failed:', err)
  })
