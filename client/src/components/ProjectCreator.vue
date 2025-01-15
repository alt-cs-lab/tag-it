<script setup>
// Library imports
import { ref, reactive } from 'vue'

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

// Variables
const visible = ref(false)
const initialValues = reactive({
    projectname: ''
});

// Methods

const resolver = ({ values }) => {
    const errors = {};

    if (!values.projectname) errors.projectname = [{ message: 'Project name is required.' }]

    return { errors }
};

const onFormSubmit = ({ valid, states }) => {
  console.log(states)
  
  if(valid) {
    const name = states.projectname.value
    // Update this project
    projectStore.create(name)
    // Fetch all projects to get the now-expanded list
    projectStore.fetch()
  }
}

</script>

<template>
  
  <Button @click="visible=true" size="small" variant="outlined" rounded icon="pi pi-folder-plus" iconPos="right"/>
  
  <Dialog v-model:visible="visible" modal header="Create Project">

    <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" class="flex flex-col gap-4 w-full sm:w-56">
        
      <IftaLabel>
        <InputText name="projectname" type="text" fluid />
        <label>Project Name</label>
        <Message v-if="$form.projectname?.invalid" severity="error" size="small" variant="simple">{{ $form.projectname.error?.message }}</Message>
      </IftaLabel>
            
      <Button type="Create Project" label="Submit" />
    </Form>

  </Dialog>

</template>