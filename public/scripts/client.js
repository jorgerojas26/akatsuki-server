setTimeout(() => {
  const FECA_PROXY_URL = 'https://feca-proxy.appen.com';
  const job_content_container = document.querySelector('.content');
  const job_title = document.querySelector('.job-title');
  const slug_job_title = job_title?.innerText
    .replace(/ /g, '-')
    .replace(/[^a-zA-Z-]/g, '')
    .toLowerCase();

  window.current_task_info = {
    name: '',
    collections: [],
    keywords: [],
    script: '',
  };

  const visualizer_modal_template = ` <div id="myModal" class="custom-modal"> <div class="custom-modal-content"> <div class="custom-modal-header"> <span class="close">&times;</span> <h2 id='visualizer-modal-title'>Resource name</h2></div> <div class="custom-modal-body"> <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="text-content" placeholder="Escriba el contenido" style='height: 550px; width: calc(100% - 15px); resize: none;'></textarea> </div> <div class="custom-modal-footer"> <div> <input type='button' id='delete-button' style='background: red; color: white;' value='Delete' /> </div> <div> <input type='submit' id='save-button' style='background: green; color: white;' value='Save'/> <input type='button' id='cancel-button' value='Cancel' /> </div> </div> </div> </div> `;
  document.body.insertAdjacentHTML('beforeend', visualizer_modal_template);

  const create_guide_modal_template = ` <div id="create_guide_modal" class="custom-modal"> <div class="custom-modal-content"> <div class="custom-modal-header"> <span class="close">&times;</span> <h2 id='create-guide-modal-title'>Nueva guía</h2> </div> <form id='create_guide_form'> <div class="custom-modal-body"> <div style='padding: 10px; margin: 10px'> <label for="guide_name">* Nombre de la guía</label> <input type="text" id="guide_name" placeholder="Nombre de la guía" value='${
    slug_job_title || ''
  }' required> <div style='display: flex; gap: 10px;'> <div style='width: 100%;'> <label>Collections (JSON)</label> <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="guide_collections" style='height: 150px; resize: none;'></textarea> <span id='guide_collections_error' style='color: red;'></span> </div> <div style='width: 100%;'> <label>Keywords (JSON)</label> <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="guide_keywords" clave" style='height: 150px; resize: none;'></textarea> <span id='guide_keywords_error' style='color: red;'></span> </div> <div style='width: 100%;'> <label>Script</label> <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="guide_script" style='height: 150px; resize: none;'></textarea> <span id='guide_script_error' style='color: red;'></span> </div> </div> </div> </div> <div class="custom-modal-footer"> <div> <span class='submit_message' /> </div> <div> <button type='submit' style='background: green; color: white;'>Save</button> <input type='button' id='cancel-button' value='Cancel' /> </div> </div> </form> </div> </div> `;

  document.body.insertAdjacentHTML('beforeend', create_guide_modal_template);

  const menu = ` <div class='select-container' style='grid-column: 1/3'> <button id='add_guide_button'>➕</button> <button id='view_guide_button'>🔍</button> <select id='guide_selector'> <option value='' disabled selected>Select guide</option> </select> <span id='guide_selector_message' style='display: none;'>✅</span> </div> <div class='select-container'> <button id='view_keyword_button'>🔍</button> <select id='keyword_selector'> <option value='' disabled selected>Select keyword</option> </select> <span id='keyword_selector_message' style='display: none;'>✅</span> </div> <div class='select-container'> <button id='view_script_button'>🔍</button> <select id='script_selector'> <option value='' disabled selected>Select script</option> </select> <span id='script_selector_message' style='display: none;'>✅</span> </div> <div class='select-container' style='grid-column: 1/3; justify-content: center;' > <span id='connection-message'></span> </div> `;

  const config_container = document.createElement('div');
  config_container.style.display = 'flex';
  config_container.style.justifyContent = 'center';
  config_container.style.marginTop = '10px';

  config_container.insertAdjacentHTML(
    'beforeend',
    ` <div style='width: 100%; height: max-content; border: 1px solid black; border-style: dashed; display: grid; grid-template-columns: 1fr 1fr; padding: 10px;'> ${menu} </div> `
  );
  const reload_all_button = document.createElement('button');
  reload_all_button.innerText = 'Reload all';
  reload_all_button.style.background = '#ccc';
  reload_all_button.style.color = '#333';
  reload_all_button.style.border = '1px solid #ccc';
  reload_all_button.style.borderRadius = '5px';
  reload_all_button.style.padding = '5px';
  reload_all_button.style.margin = '0px';
  reload_all_button.onclick = function () {
    reload_all_button.innerText = 'Reloading...';
    reload_all_button.disabled = true;
    socket.emit('reload_all');
  };

  const reload_all_this_task = document.createElement('button');
  reload_all_this_task.innerText = 'Reload all this task';
  reload_all_this_task.style.background = '#ccc';
  reload_all_this_task.style.color = '#333';
  reload_all_this_task.style.border = '1px solid #ccc';
  reload_all_this_task.style.borderRadius = '5px';
  reload_all_this_task.style.padding = '5px';
  reload_all_this_task.style.margin = '0px 5px';
  reload_all_this_task.onclick = function () {
    reload_all_this_task.innerText = 'Reloading...';
    reload_all_this_task.disabled = true;
    socket.emit('reload_all', job_title.innerText);
  };

  job_content_container.insertBefore(config_container, job_content_container.firstChild);
  job_content_container.insertBefore(reload_all_button, job_content_container.firstChild);
  job_content_container.insertBefore(reload_all_this_task, job_content_container.firstChild);

  // SELECTORS
  const guide_selector = config_container.querySelector('#guide_selector');
  const keyword_selector = config_container.querySelector('#keyword_selector');
  const script_selector = config_container.querySelector('#script_selector');

  // MODAL ELEMENTS
  const create_guide_modal = document.querySelector('#create_guide_modal');
  const visualizer_modal = document.querySelector('#myModal');

  // BUTTON ELEMENTS
  const add_guide_button = config_container.querySelector('#add_guide_button');
  const view_collections_button = config_container.querySelector('#view_guide_button');
  const view_keyword_button = config_container.querySelector('#view_keyword_button');
  const view_script_button = config_container.querySelector('#view_script_button');

  // MODAL ELEMENTS
  const visualizer_modal_title = visualizer_modal.querySelector('#visualizer-modal-title');
  const visualizer_modal_textarea = visualizer_modal.querySelector('#text-content');
  const visualizer_close_button = visualizer_modal.querySelector('.close');
  const visualizer_delete_button = visualizer_modal.querySelector('#delete-button');
  const visualizer_save_button = visualizer_modal.querySelector('#save-button');
  const visualizer_cancel_button = visualizer_modal.querySelector('#cancel-button');

  const create_guide_modal_title = create_guide_modal.querySelector('#create-guide-modal-title');
  const create_guide_close_button = create_guide_modal.querySelector('.close');
  const create_guide_save_button = create_guide_modal.querySelector('#save-button');
  const create_guide_cancel_button = create_guide_modal.querySelector('#cancel-button');
  const save_create_guide_button = create_guide_modal.querySelector('input[type=submit]');
  const create_guide_form = create_guide_modal.querySelector('form');

  // EVENT LISTENERS
  guide_selector.onchange = function () {
    const selected_guide = guide_selector.options[guide_selector.selectedIndex].value;
    onSelectorChange({ guide_id: selected_guide, keywords_id: selected_guide, script_id: selected_guide });
  };

  keyword_selector.onchange = function () {
    const selected_keywords = keyword_selector.options[keyword_selector.selectedIndex].value;
    onSelectorChange({ keywords_id: selected_keywords });
  };

  script_selector.onchange = function () {
    const selected_script = script_selector.options[script_selector.selectedIndex].value;
    onSelectorChange({ script_id: selected_script });
  };

  visualizer_close_button.onclick = () => {
    visualizer_modal_textarea.value = '';
    visualizer_modal.style.display = 'none';
  };
  visualizer_cancel_button.onclick = () => {
    visualizer_modal_textarea.value = '';
    visualizer_modal.style.display = 'none';
  };
  create_guide_close_button.onclick = () => {
    create_guide_form.reset();
    create_guide_modal.style.display = 'none';
  };
  create_guide_cancel_button.onclick = () => {
    create_guide_form.reset();
    create_guide_modal.style.display = 'none';
  };

  // VIEW RESOURCE BUTTON LISTENERS
  view_collections_button.onclick = () => {
    const selected = guide_selector.options[guide_selector.selectedIndex];
    const title = 'Collections: ' + selected.text;

    visualizer_save_button.setAttribute('data-resource-id', selected.value);
    visualizer_save_button.setAttribute('data-resource-name', 'collections');
    const parsedCollections = JSON.parse(window.current_task_info.collections);
    const resourceCount = parsedCollections.length;
    visualize_resource(JSON.stringify(parsedCollections), title, resourceCount);
  };

  view_keyword_button.onclick = () => {
    const selected = keyword_selector.options[keyword_selector.selectedIndex];
    const title = 'Keywords: ' + selected.text;

    visualizer_save_button.setAttribute('data-resource-id', selected.value);
    visualizer_save_button.setAttribute('data-resource-name', 'keywords');
    visualize_resource(JSON.stringify(JSON.parse(window.current_task_info.keywords), null, 2), title);
  };

  view_script_button.onclick = () => {
    const selected = script_selector.options[script_selector.selectedIndex];
    const title = 'Script: ' + selected.text;

    visualizer_save_button.setAttribute('data-resource-id', selected.value);
    visualizer_save_button.setAttribute('data-resource-name', 'script');
    visualize_resource(window.current_task_info.script, title);
  };

  visualizer_save_button.onclick = () => {
    const text = visualizer_modal_textarea.value;
    const resource_id = visualizer_save_button.getAttribute('data-resource-id');
    const resource_name = visualizer_save_button.getAttribute('data-resource-name');

    if ((resource_name === 'collections' || resource_name === 'keywords') && !is_json_valid(text)) {
      visualizer_modal.style.display = 'none';
      showMessage('Invalid JSON', 'red');
      return;
    }

    update_resource(resource_id, JSON.stringify({ [resource_name]: text }));

    if (resource_name === 'script' && !window.location.href.includes('dashboard')) {
      window.current_task_info.script = text;
      eval(text);
    }
  };

  add_guide_button.onclick = () => {
    setTimeout(() => {
      create_guide_modal.querySelector('#guide_name').focus();
      create_guide_modal.querySelector('#guide_name').select();
    });
    create_guide_modal.style.display = 'flex';
  };

  create_guide_form?.addEventListener('submit', create_guide);

  get_server_info_for_this_task();
  socket.on('connect', () => {
    showMessage('Connected to server', 'green');
  });

  socket.on('connect_error', (error) => {
    showMessage(`Connection error [${error.message}]: reconnecting...`, 'red');
  });

  socket.on('reload', (task_name) => {
    if (task_name) {
      if (job_title.innerText === task_name) {
        document.title = 'Reloading page...';
        location.reload();
      }
    } else {
      document.title = 'Reloading page...';
      location.reload();
    }
  });

  function fetch_earnings() {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: FECA_PROXY_URL + '/v1/users/payments_summary',
        credentials: 'include',
        responseType: 'json',
        onload: function (response) {
          if (response.status === 200) {
            resolve(response.response);
          }
        },
      });
    });
  }

  function visualize_resource(resource_text, title) {
    visualizer_modal_title.innerHTML = title;
    if (resource_text) {
      visualizer_modal_textarea.value = '';
      visualizer_modal_textarea.value = resource_text;
    } else {
      visualizer_modal_textarea.placeholder = 'No resource to visualize';
    }
    visualizer_modal.style.display = 'flex';
  }

  function showMessage(message, color) {
    const connection_message = document.querySelector('#connection-message');
    connection_message.style.color = color;
    connection_message.innerHTML = message;
  }

  function onSelectorChange(payload, callback) {
    try {
      GM_xmlhttpRequest({
        method: 'PATCH',
        url: `${SERVER_URL}/task-guide-info/` + slug_job_title,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(payload),
        responseType: 'json',
        onload: function (response) {
          if (response.status === 200) {
            window.current_task_info = response.response.guide_info;
            guide_selector.value = response.response.selector_info.guide_id;
            keyword_selector.value = response.response.selector_info.keywords_id;
            script_selector.value = response.response.selector_info.script_id;
            if (!window.location.href.includes('dashboard')) {
              eval(window.current_task_info.script);
            }
            showMessage('Successfully updated', 'green');
            callback && callback();
          } else {
            showMessage('Error updating: ' + response.responseText, 'red');
          }
        },
      });
    } catch (e) {
      showMessage('Error updating: ' + e.message, 'red');
      console.log(e);
    }
  }

  function is_json_valid(json_string) {
    try {
      JSON.parse(json_string);
    } catch (e) {
      return false;
    }
    return true;
  }

  async function get_server_info_for_this_task() {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `${SERVER_URL}/guides/needed/` + slug_job_title,
      responseType: 'json',
      onload: function (response) {
        const { all_guides, selector_info, current_task_guide_info } = response.response;

        populate_selectors(all_guides, selector_info);
        window.current_task_info = current_task_guide_info;
        if (!window.location.href.includes('dashboard')) {
          eval(window.current_task_info.script);
        }
      },
    });
  }

  function get_all_guides() {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `${SERVER_URL}/guides?namesOnly=true`,
        responseType: 'json',
        onload: async (response) => {
          const all_guides = response.response;
          resolve(all_guides);
        },
      });
    });
  }

  function get_actual_info(guide_id) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `${SERVER_URL}/guides/` + guide_id,
        responseType: 'json',
        onload: function (response) {
          resolve(response.response);
        },
      });
    });
  }

  function get_task_guide_info() {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `${SERVER_URL}/task-guide-info/` + slug_job_title,
        responseType: 'json',
        onload: function (response) {
          resolve(response.response);
        },
      });
    });
  }

  function populate_selectors(all_guides, current_task_guide_info) {
    const guide_selector = document.querySelector('#guide_selector');
    const keyword_selector = document.querySelector('#keyword_selector');
    const script_selector = document.querySelector('#script_selector');

    const guide_selector_message = document.querySelector('#guide_selector_message');
    const keyword_selector_message = document.querySelector('#keyword_selector_message');
    const script_selector_message = document.querySelector('#script_selector_message');

    guide_selector.innerHTML = '';
    keyword_selector.innerHTML = '';
    script_selector.innerHTML = '';

    guide_selector.insertAdjacentHTML('beforeend', "<option value='' disabled selected>Select guide</option>");
    keyword_selector.insertAdjacentHTML('beforeend', "<option value='' disabled selected>Select keyword</option>");
    script_selector.insertAdjacentHTML('beforeend', "<option value='' disabled selected>Select script</option>");

    if (current_task_guide_info?.guide_id !== 'none') guide_selector_message.style.display = 'block';
    if (current_task_guide_info?.keywords_id !== 'none') keyword_selector_message.style.display = 'block';
    if (current_task_guide_info?.script_id !== 'none') script_selector_message.style.display = 'block';

    all_guides.forEach((guide) => {
      guide_selector.insertAdjacentHTML(
        'beforeend',
        `<option value='${guide._id}' ${current_task_guide_info?.guide_id === guide._id ? 'selected' : ''}>${
          guide.name
        }</option>`
      );
      keyword_selector.insertAdjacentHTML(
        'beforeend',
        `<option value='${guide._id}' ${current_task_guide_info?.keywords_id === guide._id ? 'selected' : ''}>${
          guide.name
        }</option>`
      );
      script_selector.insertAdjacentHTML(
        'beforeend',
        `<option value='${guide._id}' ${current_task_guide_info?.script_id === guide._id ? 'selected' : ''}>${
          guide.name
        }</option>`
      );
    });
  }

  function create_guide(event) {
    event.preventDefault();
    const guide_name = create_guide_modal.querySelector('#guide_name').value;
    const guide_collections = create_guide_modal.querySelector('#guide_collections').value;
    const guide_keywords = create_guide_modal.querySelector('#guide_keywords').value;
    const guide_script = create_guide_modal.querySelector('#guide_script').value;

    if (!is_json_valid(guide_collections) && !is_json_valid(guide_keywords)) {
      create_guide_modal.style.display = 'none';
      showMessage('Invalid JSON', 'red');
      return;
    }

    GM_xmlhttpRequest({
      method: 'POST',
      url: `${SERVER_URL}/guides`,
      headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
      data: JSON.stringify({
        name: guide_name,
        collections: guide_collections,
        keywords: guide_keywords,
        script: guide_script,
      }),
      onload: function (response) {
        create_guide_modal.style.display = 'none';
        if (response.status === 200) {
          showMessage('Successfully created', 'green');

          const new_option = document.createElement('option');
          new_option.text = guide_name;
          new_option.value = response.response._id;
          guide_selector.insertBefore(new_option, guide_selector.firstChild);
          keyword_selector.insertBefore(new_option.cloneNode(true), keyword_selector.firstChild);
          script_selector.insertBefore(new_option.cloneNode(true), script_selector.firstChild);
        } else {
          showMessage('Failed to create ' + response.response.error.message, 'red');
        }
        create_guide_form.reset();
      },
    });
  }

  function update_resource(resource_id, payload) {
    try {
      GM_xmlhttpRequest({
        method: 'PATCH',
        url: `${SERVER_URL}/guides/` + resource_id,
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',
        data: payload,
        onload: function (response) {
          visualizer_modal.style.display = 'none';
          if (response.status === 200) {
            window.current_task_info = response.response;
            showMessage('Successfully updated', 'green');
            visualizer_modal_textarea.value = '';
          } else {
            showMessage('Failed to update ' + response.response.error.message, 'red');
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  function add_item_to_guide(payload) {
    console.log('receiving payload', payload);
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: `${SERVER_URL}/guides/${current_task_info._id}`,
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',
        data: JSON.stringify({
          task: payload,
        }),
        onload: function (response) {
          resolve(response.response);
        },
      });
    });
  }

  const jsawesome = document.querySelectorAll('.jsawesome');

  jsawesome.forEach((wrapper) => {
    const inputs = wrapper.querySelectorAll('input,textarea');
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = 'Enviar';
    button.onclick = () => {
      const inputs_response = [];
      if (!window.job_identifier) {
        alert('Please add window.job_identifier on the server script of this task');
        return;
      }

      const identifier_element = wrapper.querySelector(window.job_identifier);
      let identifier_value = '';

      if (identifier_element.tagName === 'IMG') {
        identifier_value = identifier_element.src;
      } else {
        identifier_value = identifier_element.innerText.replace('"', '');
      }

      Array.from(inputs).forEach((input, index) => {
        if (
          input.type !== 'hidden' &&
          (((input.type === 'checkbox' || input.type === 'radio') && input.checked) ||
            (input.type === 'text' && input.value !== '') ||
            (input.tagName === 'TEXTAREA' && input.value !== ''))
        ) {
          inputs_response.push({
            tagName: input.tagName,
            type: input.type,
            value: input.value,
            checked: input.checked,
            index,
          });
        }
      });

      const response = add_item_to_guide({
        identifier_element: window.job_identifier,
        identifier_value,
        responses: inputs_response,
      });

      if (!response.error) {
        wrapper.style.background = 'lightgreen';
      }
    };
    wrapper.append(button);
  });

  if (window.location.href.includes('/assignments/dashboard')) {
    const error_div = document.querySelector('.hero-unit');
    error_div.parentElement.removeChild(error_div);
  }

  GM_addStyle(`
.custom-modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 10000; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

.custom-modal-content {
  position: relative;
  background-color: #fefefe;
  margin: auto;
  padding: 0;
  border: 1px solid #888;
  width: 80%;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
  animation-name: animatetop;
  animation-duration: 0.4s
}

.custom-modal-header {
  padding: 10px 20px 0 10px;
  color: white;
  border-bottom: 1px solid #f1f1f1;
}

.custom-modal-body {
  display: flex;
  flex-direction: column;
  max-height: 600px;
  width: 100%;
  overflow: auto;
}

.custom-modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  color: white;
  border-top: 1px solid #f1f1f1;
  gap: 10px;
}

.custom-modal-footer input[type=button] {
  padding: 5px 10px;
  border-radius: 4px;
}

.custom-modal-footer input[type=submit] {
  padding: 5px 10px;
  border-radius: 4px;
}

.custom-modal-footer button {
  padding: 5px 10px;
  border-radius: 4px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

@keyframes animatetop {
  from {top: -300px; opacity: 0}
  to {top: 0; opacity: 1}
}

select {
  margin-bottom: 0;
  width: 100%;
}

.select-container {
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 5px;
}
`);
});
