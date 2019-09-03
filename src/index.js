const commander = require('commander')
const shell = require('shelljs')
const { red, cyan, green, bold } = require('kleur')
const envinfo = require('envinfo')
var glob = require('glob')
let fs = require('fs')
let path = require('path')

const createPikaApp = appName => {
  return new Promise(resolve => {
    if (appName) {
      if (path.isAbsolute(appName)) {
        shell.exec(`mkdir ${appName}`, () => {
          console.log(`Created app: ${cyan().bold(appName)}`)
          resolve(true)
        })
      } else {
        shell.exec(`cd ${process.cwd()} && mkdir ${appName}`, () => {
          console.log(`Created app: ${cyan().bold(appName)}`)
          resolve(true)
        })
      }
    } else {
      console.log(bold().red('\nNo app name was provided.'))
      console.log(bold('\nUsage:'))
      console.log('\ncreate-pika-app ', 'app-name\n'.cyan)
      resolve(false)
    }
  })
}

const initApp = appDirectory => {
  return new Promise(resolve => {
    shell.exec(`cd ${appDirectory} && npm init --yes > /dev/null`, () => {
      resolve()
    })
  })
}

const copyTemplates = appDirectory => {
  var getDirectories = function(src, callback) {
    glob(src + '/**/*', callback)
  }
  let globPath

  try {
    fs.statSync(
      `${appDirectory}/node_modules/create-pika-app/assets/templates/README.md`
    )
    globPath = `${appDirectory}/node_modules/create-pika-app/assets/templates`
  } catch (e) {
    globPath = `${appDirectory}/assets/templates/`
  }
  getDirectories(globPath, (err, res) => {
    if (err) {
      console.error(red(`There was an error copying the template files`))
    } else {
      console.log(res)
    }
  })
  // return new Promise(resolve => {
  //   let promises = []
  //   Object.keys(templates).forEach((fileName, i) => {
  //     promises[i] = new Promise(res => {
  //       fs.writeFile(
  //         `${appDirectory}/src/${fileName}`,
  //         templates[fileName],
  //         function(err) {
  //           if (err) {
  //             return console.log(err)
  //           }
  //           res()
  //         },
  //       )
  //     })
  //   })
  //   Promise.all(promises).then(() => {
  //     resolve()
  //   })
  // })
}

const installDependencies = appDirectory => {
  return new Promise(resolve => {
    console.log(
      cyan(
        '\nInstalling preact, preact-compat, emotion, preact-emotion, and preact-router\n'
      )
    )
    // console.log(`${process.cwd()}/${appName}`)
    shell.exec(
      `cd ${appDirectory} && npm install --save preact preact-compat preact-emotion preact-router emotion > /dev/null`,
      () => {
        console.log(green('\nFinished installing dependencies\n'))
        resolve()
      }
    )
  })
}

const installDevDependencies = appDirectory => {
  return new Promise(resolve => {
    console.log(
      cyan(
        '\nInstalling @pika/web, typescript, eslint, serve, babel, and all their required plugins/presets\n'
      )
    )
    // console.log(`${process.cwd()}/${appName}`)
    shell.exec(
      `cd ${appDirectory} && npm install -D @babel/cli @babel/core @pika/web @typescript-eslint/eslint-plugin @typescript-eslint/parser babel-plugin-import-pika-web copyfiles prettier eslint eslint-config-airbnb-typescript eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react serve typescript > /dev/null`,
      () => {
        console.log(green('\nFinished installing dev dependencies\n'))
        resolve()
      }
    )
  })
}

const cli = async () => {
  let appName
  let appDirectory = `${process.cwd()}/${appName}`
  if (path.isAbsolute(appName)) {
    appDirectory = appName
  }
  const program = new commander.Command(process.argv[2])
    .version('0.1.0')
    .arguments('<project-directory>')
    .usage(`${green('<project-directory>')} [options]`)
    .action(name => {
      appName = name
    })
    .option('--verbose', 'print additional logs')
    .option('--info', 'print environment debug info')
    .allowUnknownOption()
    .on('--help', () => {
      console.log(`    Only ${green('<project-directory>')} is required.`)
      console.log()
      console.log(
        `    If you have any problems, do not hesitate to file an issue:`
      )
      console.log(
        `      ${cyan('https://github.com/ndom91/create-pika-app/issues/new')}`
      )
      console.log()
    })
    .parse(process.argv)

  if (program.info) {
    console.log(bold('\nEnvironment Info:'))
    return envinfo
      .run(
        {
          System: ['OS', 'CPU'],
          Binaries: ['Node', 'npm'],
          Browsers: [
            'Chrome',
            'Edge',
            'Internet Explorer',
            'Firefox',
            'Safari',
          ],
          npmPackages: [
            'preact',
            'preact-compat',
            '@pika/web',
            'preact-emotion',
          ],
          npmGlobalPackages: ['create-pika-app'],
        },
        {
          duplicates: true,
          showNotFound: true,
        }
      )
      .then(console.log)
  }

  if (typeof appName === undefined) {
    console.error('Please specify the project name:')
    console.log(`  ${cyan(program.name())} ${green('<project-directory>')}`)
    console.log()
    console.log('For example:')
    console.log(`  ${cyan(program.name())} ${green('my-pika-app')}`)
    console.log()
    console.log(`Run ${cyan(`${program.name()} --help`)} to see all options.`)
  }

  console.log(path.dirname(fs.realpathSync(__dirname)))
  console.log(path.dirname(fs.realpathSync(__filename)))
  console.log(process.cwd())

  let success = await createPikaApp(appName)
  if (!success && typeof appName !== undefined) {
    console.log(
      bold().red(
        'Something went wrong while trying to create a new Preact app using create-pika-app'
      )
    )
    return false
  }
  await initApp(appDirectory)
  await copyTemplates(appDirectory)
  await installDependencies(appDirectory)
  await installDevDependencies(appDirectory)
  console.log(bold().green('All done 🎉'))
}

export default cli()
