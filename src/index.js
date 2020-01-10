// const args = process.argv.slice(2)
// if (!alias) throw new Error('First argument should be a sandbox alias. ex: `npm start <my-alias>`')
// if (!folderName) throw new Error('Second argument should be a folder api name. ex: `npm start <my-alias> <my-folder-name>`')

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const outputPath = path.join(__dirname, 'logs')
const outputFile = path.join(outputPath, 'emailTemplateNames.log')

fs.mkdirSync(outputPath, { recursive: true })

// const alias = args[0]
// const folderName = args[1]
const alias = 'nlg-uat'
const folderName = 'unfiled$public'
const metaData = 'EmailTemplate'

const mdapiArgs = [ 'force:mdapi:listmetadata', '-u', alias, '-m', metaData, '--folder', folderName, '--json' ]
const options = {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  shell: true
}

const burpStream = stream => {
  return new Promise((resolve, reject) => {
    const buffer = []
    stream
      .on('data', data => {
        buffer.push(data)
      })
      .on('end', () => {
        resolve(buffer.join('').toString().trim())
      })
      .on('error', err => {
        reject(err)
      })
  })
}

const main = () => {
  const listMetadata = spawn('sfdx', mdapiArgs, options)
  burpStream(listMetadata.stdout)
    .then(data => {
      const reports = JSON.parse(data).result
      const fullNames = reports.map(r => r.fullName)
      fs.writeFile(outputFile, fullNames.join('\n'), err => {
        if (err) console.error('Error writing to file: ', err)
      })
    })
    .catch(err => {
      console.error('Error executing sfdx force:mdapi:listmetadata', mdapiArgs, err)
    })
}

main()