import { getConfig, isConfigStored, storeConfig } from "./storage.js"
import { isMain, runMapper, toElementData } from "./util.js"

const patteri = document.getElementById("patteri")
const config = document.getElementById("config")
const showConfig = document.getElementById("showConfig")
const errorLabel = document.getElementById("error")
const tokenElement = document.getElementById("token")
const repoElement = document.getElementById("repo")

var running
var timer
var configuration = {}

setStopped()

if (isConfigStored()) {
  configuration = getConfig()
  tokenElement.value = configuration.token
  repoElement.value = configuration.repo
  setRunning()
  processWorkflows().catch(handleError)
} else if (window.location.hostname === "localhost") {
  const searchParams = new URLSearchParams(window.location.search)
  const token = searchParams.get("token")
  const repo = searchParams.get("repo")

  if (token !== null && token !== "" && repo !== null && repo !== "") {
    configuration = { token, repo }
    setRunning()
    processWorkflows().catch(handleError)
  }
}

function handleError(err) {
  setStopped()
  // eslint-disable-next-line no-console
  console.log(err)
  errorLabel.textContent = err
  throw err
}

// eslint-disable-next-line no-unused-vars
window.enableConfig = function enableConfig() {
  setStopped()
  config.removeAttribute("class")
  showConfig.setAttribute("class", "hide")
}

// eslint-disable-next-line no-unused-vars
window.getBuildsUsingConfig = async function getBuildsUsingConfig() {
  configuration.token = tokenElement.value
  configuration.repo = repoElement.value
  setRunning()
  processWorkflows()
}

function setRunning() {
  timer = setInterval(
    processWorkflows,
    document.getElementById("interval").value * 1000
  )
  storeConfig(configuration)
  tokenElement.value = configuration.token
  repoElement.value = configuration.repo
  config.setAttribute("class", "hide")
  showConfig.removeAttribute("class")
  errorLabel.textContent = ""
  running = true
}

function setStopped() {
  running = false
  clearInterval(timer)
}

async function getWorkflows(repo, headers) {
  const url = `https://api.github.com/repos/${repo}/actions/workflows`
  const response = await fetch(url, { headers })
  if (response.status !== 200) {
    throw new Error(`${url} ${response.status} ${response.statusText}`)
  }
  return (await response.json()).workflows.filter((w) => w.state === "active")
}

async function getBranches(repo, headers) {
  const url = `https://api.github.com/repos/${repo}/branches`
  const response = await fetch(url, { headers })
  if (response.status !== 200) {
    throw new Error(`${url} ${response.status} ${response.statusText}`)
  }
  return (await response.json()).map((b) => b.name)
}

function getWorkflowMap(workflows) {
  const workflowMap = {}
  workflows.forEach((w) => {
    workflowMap[w.id] = w
  })
  return workflowMap
}

async function getWorkflowRuns(workflowUrls, headers) {
  return await Promise.all(
    workflowUrls.map(async (u) => {
      const url = `${u}/runs`
      const response = await fetch(url, { headers })
      if (response.status !== 200) {
        throw new Error(`${url}  ${response.status} ${response.statusText}`)
      }

      const json = await response.json()
      return json.workflow_runs
    })
  )
}

function flatMapRuns(workflowRuns, workflowMap) {
  return workflowRuns.flatMap((runs) => {
    return runs.map(runMapper(workflowMap))
  })
}

function getLatestForWorkflowAndBranch(runList, branches) {
  const latestRuns = {}
  runList
    .filter((r) => branches.indexOf(r.head_branch) >= 0)
    .forEach((r) => {
      const workflowBranch = `${r.workflow_id}:${r.head_branch}`
      if (latestRuns[workflowBranch]) {
        if (latestRuns[workflowBranch].updated < r.updated)
          latestRuns[workflowBranch] = r
      } else {
        latestRuns[workflowBranch] = r
      }
    })

  return Object.values(latestRuns)
}

function compareRuns(a, b) {
  if (a.conclusionValue !== b.conclusionValue) {
    return a.conclusionValue - b.conclusionValue
  }
  if (isMain(a.head_branch) && !isMain(b.head_branch)) {
    return -1
  }
  if (!isMain(a.head_branch) && isMain(b.head_branch)) {
    return 1
  }
  return b.updated - a.updated
}

async function processWorkflows() {
  if (!running) return

  const headers = new Headers({
    Authorization: `token ${configuration.token}`,
  })
  const workflows = await getWorkflows(configuration.repo, headers).catch(
    handleError
  )
  const workflowMap = getWorkflowMap(workflows)
  const workflowUrls = workflows.map((w) => w.url)
  const workflowRuns = await getWorkflowRuns(workflowUrls, headers).catch(
    handleError
  )
  const branches = await getBranches(configuration.repo, headers)

  const runList = flatMapRuns(workflowRuns, workflowMap)
  const latest = getLatestForWorkflowAndBranch(runList, branches)
  latest.sort(compareRuns)

  const noSuccess = latest
    .filter((r) => !r.conclusion || r.conclusion !== "success")
    .map(toElement)
  const success = latest
    .filter((r) => r.conclusion && r.conclusion === "success")
    .map(toElement)

  const rows = []
  if (noSuccess.length % 2 === 1) {
    rows.push(createRow("row failed-row", [noSuccess.shift()]))
  }

  ;[...Array(noSuccess.length / 2).keys()].forEach(() => {
    rows.push(
      createRow("row failed-row", [noSuccess.shift(), noSuccess.shift()])
    )
  })

  const remainder = success.length % 8
  if (remainder > 0) {
    const firstRow = []
    ;[...Array(remainder).keys()].forEach(() => firstRow.push(success.shift()))
    rows.push(createRow("row success-row", firstRow))
  }

  ;[...Array(success.length / 8).keys()].forEach(() => {
    const r = []
    ;[...Array(8).keys()].forEach(() => r.push(success.shift()))
    rows.push(createRow("row success-row", r))
  })

  Array.from(patteri.childNodes).forEach((n) => n.remove())

  rows.forEach((e) => {
    patteri.appendChild(e)
  })
}

function createRow(className, elements) {
  const div = document.createElement("div")
  div.setAttribute("class", className)
  elements.forEach((e) => div.appendChild(e))
  return div
}

function toElement(run) {
  const data = toElementData(run)
  const element = document.createElement("div")
  element.setAttribute("class", `run-container`)
  const runContainer = document.createElement("div")
  runContainer.setAttribute("class", data.className)
  const title = document.createElement("span")
  title.setAttribute("class", "title")
  const link = document.createElement("a")
  link.setAttribute("href", data.url)
  const titleText = document.createTextNode(`${data.name} @ ${data.branch}`)
  link.appendChild(titleText)
  title.appendChild(link)
  runContainer.appendChild(title)
  element.appendChild(runContainer)
  return element
}
