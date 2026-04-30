import axios from 'axios'
const baseUrl = '/api/notes'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  const request = axios.get(baseUrl)
  console.log(baseUrl)

  // const nonExisting = {
  //   id: 10000,
  //   content: ':)',
  //   important: true
  // }

  // return request.then(response => response.data.concat(nonExisting))

  return request.then(response => response.data)
}

const create = newObject => {
  const config = {
    headers: { Authorisation: token }
  }

  const request = axios.post(baseUrl, newObject, config)
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

export default { getAll, create, update, setToken }