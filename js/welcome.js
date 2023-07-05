firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    location.replace('index.html')
  } else {
    document.getElementById('user').innerHTML = 'Hello, ' + user.email
  }
})

function logout() {
  firebase.auth().signOut()
}

const dataCollection = firebase.firestore().collection('usuarios')
const db = firebase.firestore()

// Função para criar um novo documento
function createData() {
  const name = document.getElementById('name').value
  const age = parseInt(document.getElementById('age').value)

  dataCollection
    .add({
      name: name,
      age: age
    })
    .then(function (docRef) {
      console.log('Documento criado com ID: ', docRef.id)
      clearForm()
      readData()
    })
    .catch(function (error) {
      console.error('Erro ao criar documento: ', error)
    })
}

// Função para ler os documentos da coleção
function readData() {
  dataCollection
    .get()
    .then(function (querySnapshot) {
      const dataList = document.getElementById('dataList')
      const tbody = dataList.querySelector('tbody')
      tbody.innerHTML = ''

      querySnapshot.forEach(function (doc) {
        const data = doc.data()
        const row = tbody.insertRow()
        const nameCell = row.insertCell()
        const ageCell = row.insertCell()
        const actionsCell = row.insertCell()

        nameCell.textContent = data.name
        ageCell.textContent = data.age

        // Botão de ação "Editar"
        const editButton = document.createElement('button')
        editButton.textContent = 'Edit'
        editButton.addEventListener('click', function () {
          // Chame a função para editar o registro correspondente
          editData(doc.id, data)
        })
        actionsCell.appendChild(editButton)

        // Botão de ação "Apagar"
        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'Delete'
        deleteButton.addEventListener('click', function () {
          // Chame a função para apagar o registro correspondente
          deleteData(doc.id)
        })
        actionsCell.appendChild(deleteButton)
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })
}

// Função para atualizar um documento existente
function editData(id) {
  // Recupere os dados do registro com base no ID fornecido
  dataCollection
    .doc(id)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        const data = doc.data()
        // Preencha os campos do formulário com os dados existentes
        document.getElementById('name').value = data.name
        document.getElementById('age').value = data.age

        // Ocultar botão "Editar" e mostrar botão "Salvar"
        document.getElementById('editBtn').style.display = 'none'
        document.getElementById('saveBtn').style.display = 'inline'

        // Adicionar um atributo personalizado ao botão "Salvar" para armazenar o ID do documento
        document.getElementById('saveBtn').setAttribute('data-id', id)
      } else {
        console.log('No such document!')
      }
    })
    .catch(function (error) {
      console.log('Error getting document:', error)
    })
}

function saveData() {
  const id = document.getElementById('saveBtn').getAttribute('data-id')
  const newName = document.getElementById('name').value
  const newAge = document.getElementById('age').value

  // Atualizar os dados no Firestore
  dataCollection
    .doc(id)
    .update({
      name: newName,
      age: newAge
    })
    .then(function () {
      console.log('Document successfully updated!')

      // Limpar os campos do formulário após a atualização
      document.getElementById('name').value = ''
      document.getElementById('age').value = ''

      // Ocultar botão "Salvar" e mostrar botão "Editar"
      document.getElementById('saveBtn').style.display = 'none'
      document.getElementById('editBtn').style.display = 'inline'
      readData()
    })
    .catch(function (error) {
      console.error('Error updating document: ', error)
    })
}

// Função para apagar um registro
function deleteData(id) {
  // Apague o registro com base no ID fornecido
  dataCollection
    .doc(id)
    .delete()
    .then(function () {
      console.log('Document successfully deleted!')
      // Limpe os campos do formulário após a exclusão
      document.getElementById('name').value = ''
      document.getElementById('age').value = ''
      readData()
    })
    .catch(function (error) {
      console.error('Error removing document: ', error)
    })
}

// Função para limpar o formulário
function clearForm() {
  document.getElementById('name').value = ''
  document.getElementById('age').value = ''
}

function consultaComWhere() {
  const cidades = fireSQL.query(`
  SELECT  name , age
  FROM usuarios
  `)
  cidades.then(lista => {
    for (let cidade of lista) {
      console.log(`${cidade.name} -  Age: ${cidade.age} `)
    }
  })
}
