const dataCollection = firebase.firestore().collection('training')
const groupTrainingCollection = firebase
  .firestore()
  .collection('training_group')
const db = firebase.firestore()
var userUID = ''

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    location.replace('index.html')
  } else {
    document.getElementById('user').innerHTML = 'Hello, ' + user.email
    userUID = user.userUID
  }
})

function logout() {
  firebase.auth().signOut()
}

// Obtém uma referência para o elemento <select> no HTML
const groupTrainingSelect = document.getElementById('groupTraining')

// Obtém todos os grupos de treinamento do Firestore
groupTrainingCollection
  .get()
  .then(snapshot => {
    snapshot.forEach(groupTrainingDoc => {
      const groupTrainingData = groupTrainingDoc.data()
      const groupName = groupTrainingData.name

      // Cria uma nova opção e atribui o valor do ID do grupo de treinamento
      const option = document.createElement('option')
      option.value = groupTrainingDoc.id
      option.textContent = groupName

      // Adiciona a nova opção ao elemento <select>
      groupTrainingSelect.appendChild(option)
    })
  })
  .catch(error => {
    console.error('Erro ao obter os grupos de treinamento:', error)
  })

// Event listener para capturar a seleção do grupo de treinamento
groupTrainingSelect.addEventListener('change', function () {
  const selectedGroupId = groupTrainingSelect.value // ID do grupo de treinamento selecionado

  // Faz o update da referência do grupo de treinamento para o treinamento correspondente
  dataCollection
    .doc(docId)
    .update({
      group_training: groupTrainingCollection.doc(selectedGroupId)
    })
    .then(() => {
      console.log('Referência do grupo de treinamento atualizada com sucesso!')
    })
    .catch(error => {
      console.error(
        'Erro ao atualizar a referência do grupo de treinamento:',
        error
      )
    })
})

// Função para criar um novo documento

function createData() {
  const name = document.getElementById('name').value
  const groupTrainingSelect = document.getElementById('groupTraining')
  const groupId = groupTrainingSelect.value

  // Verificar se o nome do treinamento e o grupo foram preenchidos
  if (name && groupId) {
    // Obtém todos os treinamentos existentes
    dataCollection
      .get()
      .then(snapshot => {
        const numberOfTrainings = snapshot.size // Número total de treinamentos existentes
        const nextTrainingNumber = numberOfTrainings + 1 // Próximo número disponível

        // Cria o ID para o novo treinamento
        const newTrainingId = `t${nextTrainingNumber}`

        // Criar um novo documento na coleção "data" com os dados fornecidos e o ID gerado
        dataCollection
          .doc(newTrainingId)
          .set({
            name: name,
            group_training: groupTrainingCollection.doc(groupId)
          })
          .then(() => {
            console.log('Novo registro criado com sucesso!')
            // Limpar os campos do formulário
            document.getElementById('name').value = ''
            groupTrainingSelect.value = ''
            clearForm()
            readData()
          })
          .catch(error => {
            console.error('Erro ao criar o novo registro:', error)
          })
      })
      .catch(error => {
        console.error('Erro ao obter os treinamentos:', error)
      })
  } else {
    console.error('Preencha todos os campos obrigatórios!')
  }
}

function readData() {
  dataCollection
    .get()
    .then(function (querySnapshot) {
      const dataList = document.getElementById('dataList')
      const tbody = dataList.querySelector('tbody')
      tbody.innerHTML = ''
      clearForm()
      querySnapshot.forEach(function (doc) {
        const data = doc.data()
        const row = tbody.insertRow()
        const nameCell = row.insertCell()
        const groupTrainingCell = row.insertCell()
        const actionsCell = row.insertCell()

        nameCell.textContent = data.name

        // Obtém a referência do grupo de treinamento
        const groupTrainingRef = data.group_training

        // Faz a consulta do grupo de treinamento
        groupTrainingRef
          .get()
          .then(groupTrainingDoc => {
            if (groupTrainingDoc.exists) {
              const groupTrainingData = groupTrainingDoc.data()
              const groupName = groupTrainingData.name
              groupTrainingCell.textContent = groupName
            } else {
              groupTrainingCell.textContent =
                'Grupo de Treinamento não encontrado'
            }
          })
          .catch(error => {
            console.error('Erro ao consultar o grupo de treinamento:', error)
            groupTrainingCell.textContent =
              'Erro ao consultar o grupo de treinamento'
          })

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

        // Armazene o ID do grupo de treinamento como um atributo personalizado
        const groupTrainingSelect = document.getElementById('groupTraining')
        groupTrainingSelect.setAttribute('data-groupid', data.group_training.id)

        // Definir a opção correta como selecionada no campo select
        groupTrainingSelect.value = data.group_training.id

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
  const name = document.getElementById('name').value
  const groupTrainingSelect = document.getElementById('groupTraining')
  const groupId = groupTrainingSelect.getAttribute('data-groupid')

  // Verificar se o ID, nome do treinamento e grupo foram preenchidos
  if (id && name && groupId) {
    // Atualizar o documento existente na coleção "data" com os dados fornecidos
    dataCollection
      .doc(id)
      .update({
        name: name,
        group_training: groupTrainingCollection.doc(groupId)
      })
      .then(() => {
        console.log('Registro atualizado com sucesso!')
        // Limpar os campos do formulário e redefinir os botões
        document.getElementById('name').value = ''
        groupTrainingSelect.value = ''
        document.getElementById('editBtn').style.display = 'inline'
        document.getElementById('saveBtn').style.display = 'none'
        clearForm()
        readData()
      })
      .catch(error => {
        console.error('Erro ao atualizar o registro:', error)
      })
  } else {
    console.error('Preencha todos os campos obrigatórios!')
  }
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
      document.getElementById('groupTraining').value = ''
      readData()
    })
    .catch(function (error) {
      console.error('Error removing document: ', error)
    })
}

// Função para limpar o formulário
function clearForm() {
  document.getElementById('name').value = ''
  document.getElementById('groupTraining').value = ''
}

function consultaComWhere() {
  const cidades = fireSQL.query(`
  SELECT  name , groupTraining
  FROM usuarios
  `)
  cidades.then(lista => {
    for (let cidade of lista) {
      console.log(`${cidade.name} -  Age: ${cidade.age} `)
    }
  })
}
