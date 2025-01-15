<script setup>
// Library imports
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'

// Vueprime components
import { Form } from '@primevue/forms'
import Button from 'primevue/button'
import Message from 'primevue/message'
import IftaLabel from 'primevue/iftalabel'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'

// Stores
import {useProjectStore} from '../stores/projects';
const projectStore = useProjectStore();
const { selectedProject } = storeToRefs(projectStore)

// Variables
const visible = ref(false)
const initialValues = reactive({
    usernames: ""
});

// Methods

const resolver = ({ values }) => {
    const errors = {};

    if (!values.usernames) errors.usernames = [{ message: 'Username(s) are required.' }]

    return { errors }
};

const onFormSubmit = ({ valid, states }) => {  
  if(valid) {
    const usernames = states.usernames.value.split(/[,;\s]+/)
    // Update this project   
    projectStore.addUsers(selectedProject.projectId, usernames)
    // Fetch all projects to get the now-expanded list of users
    projectStore.fetch()
  }
}

</script>

<template>
  
  <Button @click="visible=true" size="small" variant="outlined" rounded icon="pi pi-user-plus" iconPos="right"/>
  
  <Dialog v-model:visible="visible" modal header="Add Users to Project">

    <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" class="flex flex-col gap-4 w-full sm:w-56">
        
      <IftaLabel>
        <InputText name="usernames" type="text" fluid />
        <label>Usernames (as a comma, colon, or space-separated list)</label>
        <Message v-if="$form.usernames?.invalid" severity="error" size="small" variant="simple">{{ $form.usernames.error?.message }}</Message>
      </IftaLabel>
            
      <Button type="submit" label="Add Users to Project" />
    </Form>

  </Dialog>

</template>