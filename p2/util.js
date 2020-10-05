export function toElementData(run) {
  const branch = run.head_branch
  const main = isMain(branch)
  const classList = ["run", `${run.conclusion || run.status}`]
  if (!main && run.conclusion !== "success") classList.push("dev")
  {
    return {
      className: classList.join(" "),
      name: run.workflow ? run.workflow.name : null,
      branch,
      url: run.html_url,
    }
  }
}

export function isMain(branchName) {
  return branchName === "main" || branchName === "master"
}

export function runMapper(workflowMap) {
  return (run) => {
    const {
      conclusion,
      created_at,
      updated_at,
      head_branch,
      workflow_id,
      status,
      head_commit,
      id,
      url,
      html_url,
    } = run

    const created = new Date(Date.parse(created_at))
    const updated = new Date(Date.parse(updated_at))

    var conclusionValue

    switch (conclusion) {
      case "failure":
        conclusionValue = -1
        break
      case "cancelled":
        conclusionValue = -0.5
        break
      case "success":
        conclusionValue = 1
        break
      default:
        conclusionValue = 0
    }

    return {
      conclusion,
      conclusionValue,
      created,
      updated,
      head_branch,
      workflow_id,
      status,
      head_commit,
      id,
      url,
      html_url,
      workflow: workflowMap[workflow_id],
    }
  }
}
