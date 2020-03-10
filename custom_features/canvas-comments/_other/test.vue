<template>
    <div>
      <div class="canvas-collaborator-menu-item" @click="$emit('edit-project');"> 
        <div class="canvas-collaborator-submenu-delete">
          <i class="icon-trash" @click.stop="$emit('delete-project');"></i>
        </div>
        <div>
          <i v-if="project.collapsed" :class="'icon-mini-arrow-right'" @click.stop="$emit('toggle');"></i>
          <i v-else :class="'icon-mini-arrow-down'" @click.stop="$emit('toggle');"></i>
          <b>{{project.data.name}}</b>
        </div>
      </div>
      <div v-if="!collapsed">
        <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-todo" @click="openModal('new-todo'); newTodoProject=project.data._id;">
          <i class="icon-add"></i>
          New Todo 
        </div>
        <div v-for="(todo, x) in todos" :key="x">
          <todo-item 
              v-if="todo.pageTypes.includes(pageType)||pageType==''" 
              :pageType="pageType" 
              :pageId="pageId" 
              :todo="todo" 
              @edit-todo="openModal('edit-todo'); newTodoPageTypes=todo.pageTypes; newTodoName=todo.name;" 
              @resolve-todo="resolveTodo(todo);" 
              @unresolve-todo="unresolveTodo(todo);" 
              @delete-todo="deleteTodo(todo);"
              @toggle-comments="toggleComments(todo);"
              @load-comments="loadComments(todo);"
            >
          </todo-item>
        </div>
      </div>
    </div>
  </template>