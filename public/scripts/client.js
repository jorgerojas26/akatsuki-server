setTimeout(() => {
    const socket = window.socket;
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

    const visualizer_modal_template = ` <div id="myModal" class="custom-modal"> <div class="custom-modal-content"> <div class="custom-modal-header"> <span class="close">&times;</span> <h2 id='visualizer-modal-title'>Resource name</h2></div> <div class="custom-modal-body"><textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="textarea-content" placeholder="Escriba el contenido" style='display=none; height: 550px; width: calc(100% - 15px); resize: none;'></textarea><div id="json-editor-container" style='display=none; height: 550px; width: calc(100% - 15px); resize: none;'></div> <span id='TQCount'></span></div> <div class="custom-modal-footer"> <div> <input type='button' id='delete-button' style='background: red; color: white;' value='Delete' /> </div> <div> <input type='submit' id='save-button' style='background: green; color: white;' value='Save'/> <input type='button' id='cancel-button' value='Cancel' /> </div> </div> </div> </div> `;
    document.body?.insertAdjacentHTML('beforeend', visualizer_modal_template);

    const create_guide_modal_template = ` <div id="create_guide_modal" class="custom-modal"> <div class="custom-modal-content"> <div class="custom-modal-header"> <span class="close">&times;</span> <h2 id='create-guide-modal-title'>Nueva guía</h2> </div> <form id='create_guide_form'> <div class="custom-modal-body"> <div style='padding: 10px; margin: 10px'> <label for="guide_name">* Nombre de la guía</label> <input type="text" id="guide_name" placeholder="Nombre de la guía" value='${
        slug_job_title || ''
    }' required> <div style='display: flex; gap: 10px;'> <div style='width: 100%;'> <label>Collections (JSON)</label> <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="guide_collections" style='height: 150px; resize: none;'></textarea> <span id='guide_collections_error' style='color: red;'></span> </div> <div style='width: 100%;'> <label>Keywords (JSON)</label> <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="guide_keywords" clave" style='height: 150px; resize: none;'></textarea> <span id='guide_keywords_error' style='color: red;'></span> </div> <div style='width: 100%;'> <label>Script</label> <textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="guide_script" style='height: 150px; resize: none;'></textarea> <span id='guide_script_error' style='color: red;'></span> </div> </div> </div> </div> <div class="custom-modal-footer"> <div> <span class='submit_message' /> </div> <div> <button type='submit' style='background: green; color: white;'>Save</button> <input type='button' id='cancel-button' value='Cancel' /> </div> </div> </form> </div> </div> `;

    document.body?.insertAdjacentHTML('beforeend', create_guide_modal_template);

    const menu = ` <div class='select-container' style='grid-column: 1/3'> <button id='add_guide_button'>➕</button> <button id='view_guide_button'>🔍</button> <select id='guide_selector'> <option value='' disabled selected>Select guide</option> </select> <span id='guide_selector_message' style='display: none;'>✅</span> </div> <div class='select-container'> <button id='view_keywords_button'>🔍</button> <select id='keyword_selector'> <option value='' disabled selected>Select keyword</option> </select> <span id='keyword_selector_message' style='display: none;'>✅</span> </div> <div class='select-container'> <button id='view_script_button'>🔍</button> <select id='script_selector'> <option value='' disabled selected>Select script</option> </select> <span id='script_selector_message' style='display: none;'>✅</span> </div> <div class='select-container' style='grid-column: 1/3; justify-content: center;' > <span id='connection-message'></span> </div> `;

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

    job_content_container?.insertBefore(config_container, job_content_container.firstChild);
    job_content_container?.insertBefore(reload_all_button, job_content_container.firstChild);
    job_content_container?.insertBefore(reload_all_this_task, job_content_container.firstChild);

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
    const view_keywords_button = config_container.querySelector('#view_keywords_button');
    const view_script_button = config_container.querySelector('#view_script_button');
    const visualizer_close_button = visualizer_modal?.querySelector('.close');
    const visualizer_delete_button = visualizer_modal?.querySelector('#delete-button');
    const visualizer_save_button = visualizer_modal?.querySelector('#save-button');
    const visualizer_cancel_button = visualizer_modal?.querySelector('#cancel-button');
    const create_guide_close_button = create_guide_modal?.querySelector('.close');
    const create_guide_cancel_button = create_guide_modal?.querySelector('#cancel-button');

    // MODAL ELEMENTS
    const visualizer_modal_title = visualizer_modal?.querySelector('#visualizer-modal-title');
    const visualizer_modal_tq_count = visualizer_modal?.querySelector('#TQCount');
    const visualizer_modal_editor = visualizer_modal?.querySelector('#json-editor-container');
    const visualizer_textarea = visualizer_modal?.querySelector('#textarea-content');
    const json_editor = new JSONEditor(visualizer_modal_editor, {
        mode: 'code',
    });
    const create_guide_form = create_guide_modal.querySelector('form');

    // EVENT LISTENERS
    guide_selector.onchange = on_selector_change;
    keyword_selector.onchange = on_selector_change;
    script_selector.onchange = on_selector_change;

    visualizer_close_button.onclick = close_visualizer_modal;
    visualizer_cancel_button.onclick = close_visualizer_modal;
    create_guide_close_button.onclick = close_create_guide_modal;
    create_guide_cancel_button.onclick = close_create_guide_modal;

    // VIEW RESOURCE BUTTON LISTENERS
    view_collections_button.onclick = () => {
        const selected = guide_selector.options[guide_selector.selectedIndex];
        const title = 'Collections: ' + selected.text;

        visualizer_save_button.setAttribute('data-resource-id', selected.value);
        visualizer_save_button.setAttribute('data-resource-name', 'collections');
        const parsedCollections = JSON.parse(window.current_task_info.collections);
        const collections_count = parsedCollections.length;
        //json_editor.setMode('tree');
        visualizer_textarea.style.display = 'none';
        visualizer_modal_editor.style.display = 'block';
        visualize_resource(parsedCollections, title, collections_count);
    };

    view_keywords_button.onclick = () => {
        const selected = keyword_selector.options[keyword_selector.selectedIndex];
        const title = 'Keywords: ' + selected.text;

        visualizer_save_button.setAttribute('data-resource-id', selected.value);
        visualizer_save_button.setAttribute('data-resource-name', 'keywords');
        //json_editor.setMode('tree');
        visualizer_textarea.style.display = 'none';
        visualizer_modal_editor.style.display = 'block';
        visualize_resource(JSON.parse(window.current_task_info.keywords), title);
    };

    view_script_button.onclick = () => {
        const selected = script_selector.options[script_selector.selectedIndex];
        const title = 'Script: ' + selected.text;

        visualizer_save_button.setAttribute('data-resource-id', selected.value);
        visualizer_save_button.setAttribute('data-resource-name', 'script');
        visualizer_textarea.style.display = 'block';
        visualizer_modal_editor.style.display = 'none';
        visualize_resource(window.current_task_info.script, title);
    };

    visualizer_save_button.onclick = () => {
        const resource_id = visualizer_save_button.getAttribute('data-resource-id');
        const resource_name = visualizer_save_button.getAttribute('data-resource-name');
        const text = resource_name !== 'script' ? json_editor.getText() : visualizer_textarea.value;

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

    if (job_title) {
        get_server_info_for_this_task(slug_job_title);
    } else {
        get_server_info_for_this_task(get_job_title_in_support_form()?.slug);
    }
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

    function close_visualizer_modal() {
        visualizer_modal.style.display = 'none';
    }

    function close_create_guide_modal() {
        create_guide_form.reset();
        create_guide_modal.style.display = 'none';
    }

    function on_selector_change(event) {
        const selector_id = event.target.id;
        const selected_resource = event.target.options[event.target.selectedIndex].value;
        let payload = {};
        if (selector_id === 'guide_selector') {
            payload = { guide_id: selected_resource, keywords_id: selected_resource, script_id: selected_resource };
        } else if (selector_id === 'keyword_selector') {
            payload = { keywords_id: selected_resource };
        } else if (selector_id === 'script_selector') {
            payload = { script_id: selected_resource };
        }
        onSelectorChange(payload);
    }

    function visualize_resource(resource_text, title, resource_count) {
        visualizer_modal_title.innerHTML = title;

        if (resource_count) visualizer_modal_tq_count.innerText = `Number of entries ${resource_count}`;

        if (resource_text) {
            if (visualizer_textarea.style.display === 'none') {
                json_editor.set(resource_text);
            } else {
                visualizer_textarea.value = resource_text;
            }
        }
        visualizer_modal.style.display = 'flex';
    }

    function showMessage(message, color) {
        const connection_message = document.querySelector('#connection-message');
        connection_message.style.color = color;
        connection_message.innerHTML = message;
    }

    async function onSelectorChange(payload, callback) {
        const response = await fetch_resource({
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            uri: 'task-guide-info/' + slug_job_title,
            payload: JSON.stringify(payload),
        }).catch((error) => {
            showMessage('Error updating: ' + error.message, 'red');
            console.log(error);
        });

        window.current_task_info = response.guide_info;
        guide_selector.value = response.selector_info.guide_id;
        keyword_selector.value = response.selector_info.keywords_id;
        script_selector.value = response.selector_info.script_id;
        if (!window.location.href.includes('dashboard')) {
            eval(window.current_task_info.script);
        }
        showMessage('Successfully updated', 'green');
        callback && callback();
    }

    function is_json_valid(json_string) {
        try {
            JSON.parse(json_string);
        } catch (e) {
            return false;
        }
        return true;
    }

    async function get_server_info_for_this_task(job_title_slug) {
        const response = await fetch_resource({
            method: 'GET',
            uri: 'guides/needed/' + job_title_slug,
        }).catch((error) => {
            showMessage('Error getting task info: ' + error.message, 'red');
            console.log(error);
        });
        const { all_guides, selector_info, current_task_guide_info } = response;

        populate_selectors(all_guides, selector_info);
        window.current_task_info = current_task_guide_info;
        if (!window.location.href.includes('dashboard')) {
            eval(window.current_task_info.script);
        }
    }

    function populate_selectors(all_guides, selector_info) {
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

        if (selector_info?.guide_id !== 'none') guide_selector_message.style.display = 'block';
        if (selector_info?.keywords_id !== 'none') keyword_selector_message.style.display = 'block';
        if (selector_info?.script_id !== 'none') script_selector_message.style.display = 'block';

        all_guides.forEach((guide) => {
            guide_selector.insertAdjacentHTML(
                'beforeend',
                `<option value='${guide._id}' ${selector_info?.guide_id === guide._id ? 'selected' : ''}>${
                    guide.name
                }</option>`
            );
            keyword_selector.insertAdjacentHTML(
                'beforeend',
                `<option value='${guide._id}' ${selector_info?.keywords_id === guide._id ? 'selected' : ''}>${
                    guide.name
                }</option>`
            );
            script_selector.insertAdjacentHTML(
                'beforeend',
                `<option value='${guide._id}' ${selector_info?.script_id === guide._id ? 'selected' : ''}>${
                    guide.name
                }</option>`
            );
        });
    }

    async function create_guide(event) {
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

        try {
            const response = await fetch_resource({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                uri: 'guides',
                payload: JSON.stringify({
                    name: guide_name,
                    collections: guide_collections,
                    keywords: guide_keywords,
                    script: guide_script,
                }),
            });
            const new_option = document.createElement('option');
            new_option.text = guide_name;
            new_option.value = response._id;
            guide_selector.insertBefore(new_option, guide_selector.firstChild);
            keyword_selector.insertBefore(new_option.cloneNode(true), keyword_selector.firstChild);
            script_selector.insertBefore(new_option.cloneNode(true), script_selector.firstChild);
            create_guide_form.reset();
            create_guide_modal.style.display = 'none';
        } catch (e) {
            console.log(e);
            showMessage('Error creating guide: ' + e.message, 'red');
        }
    }

    async function update_resource(resource_id, payload) {
        try {
            const response = await fetch_resource({
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                uri: 'guides/' + resource_id,
                payload,
            });
            window.current_task_info = response;
            showMessage('Successfully updated', 'green');
	    close_visualizer_modal()
        } catch (error) {
            console.log(error);
            showMessage('Failed to update ' + error.message, 'red');
        }
    }

    function add_item_to_guide(payload) {
        return new Promise((resolve) => {
            fetch_resource({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                uri: 'guides/' + window.current_task_info._id,
                payload: JSON.stringify({ task: payload }),
            }).then((response) => {
                resolve(response);
            });
        });
    }

    function get_task_response(inputs, wrapper) {
        const inputs_response = [];
        const identifier_element = wrapper.querySelector(window.job_identifier);
        let identifier_value = '';

        if (identifier_element) {
            if (identifier_element.tagName === 'IMG') {
                identifier_value = identifier_element.src;
            } else {
                identifier_value = identifier_element.innerText.replace('"', '');
            }
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
        const new_item = {
            identifier_value,
            responses: inputs_response,
        };

        return new_item;
    }



    const jsawesome = document.querySelectorAll('.jsawesome');

    jsawesome.forEach((wrapper) => {
        const inputs = wrapper.querySelectorAll('input,textarea');
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = 'Enviar';
        button.onclick = () => {
            if (!window.job_identifier) {
                alert('Please add window.job_identifier on the server script of this task');
                return;
            }

            const new_item = get_task_response(inputs, wrapper);

            const response = add_item_to_guide(new_item);

            if (!response.error) {
                wrapper.style.background = 'lightgreen';
                const collections = JSON.parse(window.current_task_info.collections);
                collections.push(new_item);
                window.current_task_info.collections = JSON.stringify(collections);
            }
        };
        wrapper.append(button);
    });

    if (window.location.href.includes('/assignments/dashboard')) {
        const error_div = document.querySelector('.hero-unit');
        error_div.parentElement.removeChild(error_div);
    }

    // It is a correction

    function fetch_resource({ method, headers, payload, uri }) {
        return new Promise((resolve, reject) => {
            fetch(`${SERVER_URL}/${uri}`, {
                method,
                headers,
                body: payload,
            })
                .then((response) => {
                    resolve(response.json());
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

const missed_form = document.querySelector('#job_units_missed');

    function get_job_title_in_support_form() {
        const support_contact_form = document.querySelector('#contributor-support-contact-form');
        if (support_contact_form) {
            const support_contact_url = new URL(support_contact_form?.getAttribute('data-src'));
            const support_job_title = support_contact_url?.searchParams
                ?.get('ticket[custom_job_title]')
                .replace(/\+/g, ' ');
            const support_job_title_slug = support_job_title
                ?.replace(/ /g, '-')
                .replace(/[^a-zA-Z-]/g, '')
                .toLowerCase();

            return {
                title: support_job_title,
                slug: support_job_title_slug,
            };
        }

        return null;
    }

    function post_to_discord(blob, filename) {
        return new Promise((resolve) => {
            const formData = new FormData();

            formData.append('files[0]', blob, filename + '.html');

            fetch(window.discord_webhook_url, {
                method: 'POST',
                body: formData,
            })
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }

    if (missed_form?.action.includes('/contend')) {
	const inputs = document.querySelectorAll('input')
	Array.from(inputs).forEach(input => {
	    input.disabled = false;
	})

        const correction_scripts = document.querySelectorAll('script');
        let script_index = null;
        Array.from(correction_scripts).forEach((script, index) => {
            if (script.innerHTML.includes('show answer')) {
                script_index = index;
            }
        });
	if(script_index){
	    const problematic_script = correction_scripts[script_index];
	    console.log('problematic script', problematic_script);
	    problematic_script.parentElement.removeChild(problematic_script);
	}
	else {
	    //window.location.reload()
	}


        const correction_html = document.querySelector('html').cloneNode(true);
        const correction_job_title = get_job_title_in_support_form()?.slug || 'correction';

        const html_blob = new Blob([correction_html.outerHTML], { type: 'text/html' });
        post_to_discord(html_blob, correction_job_title);
    }

}, window.location.href.includes('file://') ? null : null)

