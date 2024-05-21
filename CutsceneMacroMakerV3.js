let cutsceneActions = [];
let actionCounter = 0;
let initialDialogPosition = { top: "25vh", left: "75vw" };

const generateUniqueId = () => `action-${actionCounter++}`;

const loadScript = (url, callback) => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
};

const addStylesheet = url => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
};

addStylesheet("https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css");

loadScript("https://code.jquery.com/ui/1.12.1/jquery-ui.js", () => {
  console.log("jQuery UI loaded");
  initializeCutsceneMacroMaker();
});

const addDialogAction = (title, content, callback, isEditing = false) => {
  const dialog = new Dialog({
    title,
    content,
    buttons: {
      ok: {
        label: "OK",
        callback: html => {
          callback(html);
          if (!isEditing) {
            outputCutsceneScript();
          }
        }
      },
      cancel: {
        label: "Cancel",
        callback: () => {
          if (typeof callback === 'function' && callback.name === 'openInitialDialog') {
            openInitialDialog();
        } else if (!isEditing) {
            outputCutsceneScript();
          }
        }
      }
    },
    default: "ok",
    render: html => {
      console.log("Dialog rendered:", title);
      setTimeout(() => {
        dialog.element[0].style.top = initialDialogPosition.top;
        dialog.element[0].style.left = initialDialogPosition.left;
      }, 0);
    }
  });
  dialog.render(true);
};

const closeAllDialogs = () => {
  Object.values(ui.windows).forEach(dialog => dialog.close());
};

const openInitialDialog = () => {
  console.log("Opening initial dialog");
  const dialogContent = `
    <style>
      .cutscene-maker-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .cutscene-maker-button, .cutscene-maker-finish {
        text-align: center;
        padding: 5px;
        border: 1px solid #ccc;
        cursor: pointer;
      }
      .cutscene-maker-finish {
        grid-column: 1 / -1;
      }
    </style>
    <div class="cutscene-maker-buttons">
      ${[
        "Camera", "Switch Scene", "Token Movement", /*"Show/Hide Token",
        "Chat", "Conditional Branch", */"Screen Flash", "Screen Shake", /*
        "Tile Movement", "Door State", "Light State", "Ambient Sound State",
        "Show Image", "Play Animation", "Play Sound", "Change Playlist",
        "Fade Out", "Fade In", "Hide UI", "Show UI",
        "Weather/Particle Effects", "Location Banner", */"Run Macro", "Wait"
      ].map(action => `<div class="cutscene-maker-button" id="${action.replace(/ /g, '')}Button">${action}</div>`).join('')}
      <div class="cutscene-maker-finish" id="finishButton">Export Macro</div>
    </div>
  `;

  const d = new Dialog({
    title: "Cutscene Macro Maker",
    content: dialogContent,
    buttons: {},
    render: html => {
      console.log("Initial dialog rendered");
      const closeDialogAndExecute = actionFunction => {
        initialDialogPosition.top = d.element[0].style.top;
        initialDialogPosition.left = d.element[0].style.left;
        d.close();
        actionFunction();
      };

      const actionMappings = [
        { id: "CameraButton", action: addCameraPositionAction },
        { id: "SwitchSceneButton", action: addSwitchSceneAction },
        { id: "TokenMovementButton", action: addTokenMovementAction },
        { id: "ScreenFlashButton", action: addScreenFlashAction },
        { id: "ScreenShakeButton", action: addScreenShakeAction },
        { id: "RunMacroButton", action: addRunMacroAction },
        { id: "WaitButton", action: addWaitAction },
        { id: "finishButton", action: outputCutsceneScript }
      ];

      actionMappings.forEach(({ id, action }) => {
        html.find(`#${id}`).click(() => {
          console.log(`Button ${id} clicked`);
          closeDialogAndExecute(action);
        });
      });

      setTimeout(() => {
        d.element[0].style.top = initialDialogPosition.top;
        d.element[0].style.left = initialDialogPosition.left;
      }, 0);
    }
  });
  d.render(true);
};

const addCameraPositionAction = (existingAction = null, copiedParams = null) => {
  console.log("Add Camera Position Action");
  const action = existingAction || {};
  let currentX, currentY, currentZoom;

  const updateCurrentPosition = () => {
    const viewPosition = canvas.scene._viewPosition;
    currentX = viewPosition.x;
    currentY = viewPosition.y;
    currentZoom = viewPosition.scale;
  };

  if (!copiedParams) {
    updateCurrentPosition();
  } else {
    currentX = copiedParams.x;
    currentY = copiedParams.y;
    currentZoom = copiedParams.scale;
  }

  const dialog = new Dialog({
    title: "Camera Position Action",
    content: `
      <form>
        <div class="form-group">
          <label for="cameraX">Camera X:</label>
          <input type="number" id="cameraX" name="cameraX" value="${action.params ? action.params.x : currentX}" style="width: 100%;">
        </div>
        <div class="form-group">
          <label for="cameraY">Camera Y:</label>
          <input type="number" id="cameraY" name="cameraY" value="${action.params ? action.params.y : currentY}" style="width: 100%;">
        </div>
        <div class="form-group">
          <label for="cameraZoom">Zoom Level:</label>
          <input type="number" id="cameraZoom" name="cameraZoom" value="${action.params ? action.params.scale : currentZoom}" step="0.1" style="width: 100%;">
        </div>
        <div class="form-group">
          <label for="panDuration">Pan Duration (in milliseconds):</label>
          <input type="number" id="panDuration" name="panDuration" value="${action.params ? action.params.duration : 1000}" step="100" style="width: 100%;">
        </div>
      </form>
      <p>Specify the camera position and zoom level, or copy the current screen position.</p>
    `,
    buttons: {
      copy: {
        icon: '<i class="fas fa-copy"></i>',
        label: "Copy Current Screen Position",
        callback: () => {
          updateCurrentPosition();
          addCameraPositionAction(existingAction, { x: currentX, y: currentY, scale: currentZoom, duration: parseInt(dialog.element.find("#panDuration").val()) });
        }
      },
      ok: {
        label: "OK",
        callback: html => {
          const x = parseFloat(html.find("#cameraX").val());
          const y = parseFloat(html.find("#cameraY").val());
          const scale = parseFloat(html.find("#cameraZoom").val());
          const duration = parseInt(html.find("#panDuration").val());
          const params = { x, y, scale, duration };
          if (existingAction) {
            updateAction(existingAction.id, params, `Camera Position (X: ${x}, Y: ${y}, Zoom: ${scale}, Duration: ${duration}ms)`);
          } else {
            const actionId = generateUniqueId();
            cutsceneActions.push({ id: actionId, description: `Camera Position (X: ${x}, Y: ${y}, Zoom: ${scale}, Duration: ${duration}ms)`, type: "camera", params });
          }
          updateActionList();
          outputCutsceneScript(); // Ensure it goes back to the output dialog
        }
      },
      cancel: {
        label: "Cancel",
        callback: () => {
          openInitialDialog();
        }
      }
    },
    default: "ok",
    render: html => {
      console.log("Dialog rendered: Camera Position Action");
      setTimeout(() => {
        dialog.element[0].style.top = initialDialogPosition.top;
        dialog.element[0].style.left = initialDialogPosition.left;
      }, 0);
    }
  });

  dialog.render(true);
};

const addSwitchSceneAction = (existingAction = null) => {
  console.log("Add Switch Scene Action");
  const action = existingAction || {};
  addDialogAction(
    "Switch Scene",
    `
      <form>
        <div class="form-group">
          <label for="sceneId">Scene ID:</label>
          <input type="text" id="sceneId" name="sceneId" value="${action.params ? action.params.sceneId : ''}" placeholder="Enter the scene ID here" style="width: 100%;">
        </div>
      </form>
      <p>Enter the ID of the scene you wish to switch to.</p>
    `,
    html => {
      const sceneId = html.find("#sceneId").val();
      const scene = game.scenes.get(sceneId);
      const sceneName = scene ? scene.name : "Unknown Scene";
      const params = { sceneId };
      if (existingAction) {
        updateAction(existingAction.id, params, `Switch Scene to ${sceneName} (ID: ${sceneId})`);
      } else {
        const actionId = generateUniqueId();
        cutsceneActions.push({ id: actionId, description: `Switch Scene to ${sceneName} (ID: ${sceneId})`, type: "switchScene", params });
      }
      updateActionList();
    },
    !!existingAction
  );
};

const addTokenMovementAction = (existingAction = null) => {
  console.log("Add Token Movement Action");
  if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn("Please select exactly one token.");
    if (!existingAction) openInitialDialog();
    return;
  }
  const selectedToken = canvas.tokens.controlled[0];
  const action = existingAction || {};
  addDialogAction(
    "Token Movement",
    `
      <p>Move the selected token to the new position, then click OK.</p>
      <form>
        <div class="form-group">
          <label for="animatePan">Enable Screen Panning:</label>
          <input type="checkbox" id="animatePan" name="animatePan" value="1" ${action.params && action.params.animatePan ? 'checked' : ''} style="margin-top: 5px;">
          <p style="font-size: 0.8em; margin-top: 5px;">Camera Panning.</p>
        </div>
        <div class="form-group">
          <label for="teleport">Teleport:</label>
          <input type="checkbox" id="teleport" name="teleport" ${action.params && action.params.teleport ? 'checked' : ''} style="margin-top: 5px;">
          <p style="font-size: 0.8em; margin-top: 5px;">Instantly move to the new position without animation.</p>
        </div>
        <div class="form-group">
          <label for="tokenRotation">Token Rotation (in degrees):</label>
          <input type="number" id="tokenRotation" name="tokenRotation" value="${action.params ? action.params.rotation : selectedToken.data.rotation}" step="1" style="width: 100%;">
        </div>
      </form>
    `,
    html => {
      const newPosition = { x: selectedToken.x, y: selectedToken.y };
      const newRotation = parseFloat(html.find("#tokenRotation").val());
      const animatePan = html.find("#animatePan")[0].checked;
      const teleport = html.find("#teleport")[0].checked;
      const params = { id: selectedToken.id, x: newPosition.x, y: newPosition.y, rotation: newRotation, animatePan, teleport };
      const description = teleport
        ? `Token Teleport (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°)`
        : `Token Movement (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°, Pan: ${params.animatePan ? 'Yes' : 'No'})`;

      if (existingAction) {
        updateAction(existingAction.id, params, description);
      } else {
        const actionId = generateUniqueId();
        cutsceneActions.push({ id: actionId, description, type: "tokenMovement", params });
      }
      updateActionList();
    },
    !!existingAction
  );
};

const addRunMacroAction = (existingAction = null) => {
  console.log("Add Run Macro Action");
  const action = existingAction || {};
  addDialogAction(
    "Run Macro Action",
    `
      <form>
        <div class="form-group">
          <label for="macroName">Macro Name:</label>
          <input type="text" id="macroName" name="macroName" value="${action.params ? action.params.macroName : ''}" placeholder="Enter macro name here" style="width: 100%;">
        </div>
      </form>
      <p>Enter the name of the macro you wish to run.</p>
    `,
    html => {
      const macroName = html.find("#macroName").val();
      const params = { macroName };
      if (existingAction) {
        updateAction(existingAction.id, params, `Run Macro: ${macroName}`);
      } else {
        const actionId = generateUniqueId();
        cutsceneActions.push({ id: actionId, description: `Run Macro: ${macroName}`, type: "runMacro", params });
      }
      updateActionList();
    },
    !!existingAction
  );
};

const addWaitAction = (existingAction = null) => {
  console.log("Add Wait Action");
  const action = existingAction || {};
  addDialogAction(
    "Wait Duration",
    `
      <form>
        <div class="form-group">
          <label for="waitDuration">Enter wait duration in milliseconds:</label>
          <input type="number" id="waitDuration" name="waitDuration" min="0" step="100" value="${action.params ? action.params.duration : 1000}" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const duration = html.find("#waitDuration").val();
        const params = { duration };
        if (existingAction) {
          updateAction(existingAction.id, params, `Wait for ${duration} ms`);
        } else {
          const actionId = generateUniqueId();
          cutsceneActions.push({ id: actionId, description: `Wait for ${duration} ms`, type: "wait", params });
        }
        updateActionList();
      },
      !!existingAction
    );
  };
  
  const addScreenFlashAction = (existingAction = null) => {
    console.log("Add Screen Flash Action");
    const action = existingAction || {};
    addDialogAction(
      "Add Screen Flash Effect",
      `
        <form>
          <div class="form-group">
            <label for="flashColor">Flash Color (hex):</label>
            <input type="text" id="flashColor" name="flashColor" value="${action.params ? action.params.color : '#FFFFFF'}" placeholder="#FFFFFF" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="flashOpacity">Opacity (0.0 - 1.0):</label>
            <input type="number" id="flashOpacity" name="flashOpacity" step="0.1" min="0.0" max="1.0" value="${action.params ? action.params.opacity : 0.5}" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="flashDuration">Duration (milliseconds):</label>
            <input type="number" id="flashDuration" name="flashDuration" step="100" min="100" value="${action.params ? action.params.duration : 1000}" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const color = html.find("#flashColor").val();
        const opacity = parseFloat(html.find("#flashOpacity").val());
        const duration = parseInt(html.find("#flashDuration").val());
        const params = { color, opacity, duration };
        if (existingAction) {
          updateAction(existingAction.id, params, `Screen Flash (Color: ${color}, Opacity: ${opacity}, Duration: ${duration}ms)`);
        } else {
          const actionId = generateUniqueId();
          cutsceneActions.push({ id: actionId, description: `Screen Flash (Color: ${color}, Opacity: ${opacity}, Duration: ${duration}ms)`, type: "screenFlash", params });
        }
        updateActionList();
      },
      !!existingAction
    );
  };
  
  const addScreenShakeAction = (existingAction = null) => {
    console.log("Add Screen Shake Action");
    const action = existingAction || {};
    addDialogAction(
      "Add Screen Shake Effect",
      `
        <form>
          <div class="form-group">
            <label for="shakeDuration">Duration (milliseconds):</label>
            <input type="number" id="shakeDuration" name="shakeDuration" value="${action.params ? action.params.duration : 1000}" step="100" min="100" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="shakeSpeed">Speed (frequency of shakes):</label>
            <input type="number" id="shakeSpeed" name="shakeSpeed" value="${action.params ? action.params.speed : 10}" step="1" min="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="shakeIntensity">Intensity (pixel displacement):</label>
            <input type="number" id="shakeIntensity" name="shakeIntensity" value="${action.params ? action.params.intensity : 5}" step="1" min="1" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const duration = parseInt(html.find("#shakeDuration").val());
        const speed = parseInt(html.find("#shakeSpeed").val());
        const intensity = parseInt(html.find("#shakeIntensity").val());
        const params = { duration, speed, intensity };
        if (existingAction) {
          updateAction(existingAction.id, params, `Screen Shake (Duration: ${duration}ms, Speed: ${speed}, Intensity: ${intensity}px)`);
        } else {
          const actionId = generateUniqueId();
          cutsceneActions.push({ id: actionId, description: `Screen Shake (Duration: ${duration}ms, Speed: ${speed}, Intensity: ${intensity}px)`, type: "screenShake", params });
        }
        updateActionList();
      },
      !!existingAction
    );
  };  
  
  const updateActionList = () => {
    console.log("Updating action list");
    const actionList = $("#actionList");
    actionList.empty();
    cutsceneActions.forEach(action => {
      actionList.append(`
        <li id="${action.id}" class="ui-state-default" style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #ccc;">
          <span>${action.description}</span>
          <div>
            <button class="edit-button" data-id="${action.id}" style="margin-right: 5px;">Edit</button>
            <button class="remove-button" data-id="${action.id}">Remove</button>
          </div>
        </li>
      `);
    });
  
    $(".edit-button").click(function() {
      const actionId = $(this).data("id");
      const action = cutsceneActions.find(action => action.id === actionId);
      if (action) {
        // Close the output dialog
        closeAllDialogs();
  
        // Open the appropriate dialog for editing the action
        switch (action.type) {
          case "camera":
            addCameraPositionAction(action);
            break;
          case "switchScene":
            addSwitchSceneAction(action);
            break;
          case "tokenMovement":
            addTokenMovementAction(action);
            break;
          case "wait":
            addWaitAction(action);
            break;
          case "screenShake":
            addScreenShakeAction(action);
            break;
          case "screenFlash":
            addScreenFlashAction(action);
            break;
          // Add more cases for other action types here as needed
        }
      }
    });
  
    $(".remove-button").click(function() {
      const actionId = $(this).data("id");
      removeAction(actionId);
    });
  
    if (!actionList.data('ui-sortable')) {
      actionList.sortable({
        update: function(event, ui) {
          const newOrder = $(this).sortable("toArray");
          const reorderedActions = newOrder.map(id => cutsceneActions.find(action => action.id === id));
          cutsceneActions = reorderedActions;
        }
      });
    }
    actionList.disableSelection();
  };
  
  const removeAction = actionId => {
    cutsceneActions = cutsceneActions.filter(action => action.id !== actionId);
    updateActionList();
  };
  
  const updateAction = (actionId, params, description) => {
    const actionIndex = cutsceneActions.findIndex(action => action.id === actionId);
    if (actionIndex !== -1) {
      cutsceneActions[actionIndex].params = params;
      cutsceneActions[actionIndex].description = description;
      updateActionList();
      outputCutsceneScript();
    }
  };
  
  const outputCutsceneScript = () => {
    console.log("Outputting cutscene script");
    closeAllDialogs(); // Close any existing dialogs to ensure only one output dialog is open
    new Dialog({
      title: "Current Action List",
      content: `
        <p>Your cutscene actions have been saved. You can now test run the script, edit the actions, or click Add Action to go back to the action list to add additional actions to the sequence.</p>
        <ul id="actionList"></ul>
      `,
      buttons: {
        testRun: {
          label: "Test Run",
          callback: html => {
            // Update order before running the test
            const newOrder = $("#actionList").sortable("toArray");
            const reorderedActions = newOrder.map(id => cutsceneActions.find(action => action.id === id));
            cutsceneActions = reorderedActions;
            const scriptToRun = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");
            const asyncScript = `(async () => { ${scriptToRun} })();`;
  
            try {
              new Function(asyncScript)();
              ui.notifications.info("Test run executed successfully.");
              // Add delay before reopening the output dialog
              setTimeout(() => {
                outputCutsceneScript();
              }, 1000); // 1-second delay (1000 milliseconds)
            } catch (error) {
              console.error("Error executing cutscene script: ", error);
              ui.notifications.error("Error executing cutscene script. Check the console for details.");
            }
  
            return false;
          }
        },
        edit: {
          label: "Add Action",
          callback: html => {
            openInitialDialog();
          }
        },
        export: {
          label: "Export",
          callback: html => {
            showExportDialog();
          }
        }
      },
      id: "cutsceneScriptOutputDialog", // Ensure this ID matches the filter condition
      render: html => {
        setTimeout(() => {
          const dialogElement = document.querySelector(`[id="cutsceneScriptOutputDialog"]`);
          dialogElement.style.top = initialDialogPosition.top;
          dialogElement.style.left = initialDialogPosition.left;
        }, 0);
        updateActionList();
      }
    }).render(true);
  };

  const showExportDialog = () => {
    console.log("Showing export dialog");
    const scriptContent = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");
    new Dialog({
      title: "Export Cutscene Script",
      content: `
        <p>Here's your cutscene script. Copy and paste it into a new macro to run it.</p>
        <textarea id="cutsceneScriptExport" style="width: 100%; height: 200px;">${scriptContent}</textarea>
      `,
      buttons: {
        copy: {
          label: "Copy to Clipboard",
          callback: html => {
            const textarea = html.find("#cutsceneScriptExport")[0];
            textarea.select();
            document.execCommand("copy");
            ui.notifications.info("Script copied to clipboard!");
            return false;
          }
        },
        back: {
          label: "Back",
          callback: html => {
            outputCutsceneScript();
          }
        },
        close: {
          label: "Close"
        }
      },
      render: html => {
        setTimeout(() => {
          const dialogElement = document.querySelector(`[id="exportScriptDialog"]`);
          dialogElement.style.top = initialDialogPosition.top;
          dialogElement.style.left = initialDialogPosition.left;
        }, 0);
      },
      id: "exportScriptDialog"
    }).render(true);
  };
  
  const generateScript = (type, params) => {
    switch (type) {
      case "camera":
        return `
          // Camera Position Action
          (async function() {
            try {
              const targetPosition = {
                x: ${params.x},
                y: ${params.y},
                scale: ${params.scale}
              };
              await canvas.animatePan({
                x: targetPosition.x,
                y: targetPosition.y,
                scale: targetPosition.scale,
                duration: ${params.duration}
              });
              await new Promise(resolve => setTimeout(resolve, ${params.duration}));
            } catch (error) {
              console.error("Error in camera position action:", error);
            }
          })();
        `;
      case "wait":
        return `
          // Wait Action
          // This script pauses the execution for the specified duration in milliseconds.
          await new Promise(resolve => setTimeout(resolve, ${params.duration}));
        `;
      case "switchScene":
        return `
          // Switch Scene Action
          (async function() {
            try {
              const scene = game.scenes.get("${params.sceneId}");
              if (scene) {
                await scene.view();
                console.log("Switched to scene: " + scene.name);
              } else {
                console.error("Scene not found with ID: ${params.sceneId}");
              }
            } catch (error) {
              console.error("Error in scene switch action:", error);
            }
          })();
        `;
      case "tokenMovement":
        return params.teleport
          ? `
            // Token Teleport Action
            (async function() {
              try {
                const token = canvas.tokens.get("${params.id}");
                if (token) {
                  await token.document.update({ x: ${params.x}, y: ${params.y}, rotation: ${params.rotation} }, { animate: false });
                }
              } catch (error) {
                console.error("Error in token teleport action:", error);
              }
            })();
          `
          : `
            // Token Movement Action
            (async function() {
              try {
                const token = canvas.tokens.get("${params.id}");
                if (token) {
                  await token.document.update({ x: ${params.x}, y: ${params.y}, rotation: ${params.rotation} });
                  ${params.animatePan ? `await canvas.animatePan({ x: ${params.x}, y: ${params.y}, duration: 1000 });` : ""}
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (error) {
                console.error("Error in token movement action:", error);
              }
            })();
          `;
      case "screenShake":
        return `
          // Screen Shake Action
          (async function() {
            try {
              const originalTransform = document.body.style.transform;
              let startTime = performance.now();
  
              function shakeScreen(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = elapsedTime / ${params.duration};
  
                if (progress < 1) {
                  let displacement = ${params.intensity} * Math.sin(progress * ${params.speed} * 2 * Math.PI);
                  displacement *= 1 - progress;
  
                  document.body.style.transform = \`translate(\${displacement}px, \${displacement}px)\`;
                  
                  requestAnimationFrame(shakeScreen);
                } else {
                  document.body.style.transform = originalTransform;
                }
              }
  
              requestAnimationFrame(shakeScreen);
            } catch (error) {
              console.error("Error in screen shake action:", error);
            }
          })();
        `;
      case "screenFlash":
        return `
          // Screen Flash Action
          (async function() {
            try {
              const flashEffect = document.createElement("div");
              flashEffect.style.position = "fixed";
              flashEffect.style.left = 0;
              flashEffect.style.top = 0;
              flashEffect.style.width = "100vw";
              flashEffect.style.height = "100vh";
              flashEffect.style.backgroundColor = "${params.color}";
              flashEffect.style.opacity = ${params.opacity};
              flashEffect.style.pointerEvents = "none";
              flashEffect.style.zIndex = "10000";
              document.body.appendChild(flashEffect);
  
              setTimeout(() => {
                flashEffect.style.transition = "opacity ${params.duration}ms";
                flashEffect.style.opacity = 0;
              }, 50);
  
              setTimeout(() => {
                flashEffect.remove();
              }, ${params.duration} + 50);
            } catch (error) {
              console.error("Error in screen flash action:", error);
            }
          })();
        `;
      case "runMacro":
        return `
          // Run Macro Action
          (async function() {
            try {
              const macro = game.macros.find(m => m.name === "${params.macroName}");
              if (macro) {
                await macro.execute();
                console.log("Executed macro: ${params.macroName}");
              } else {
                console.warn("Macro not found: ${params.macroName}");
              }
            } catch (error) {
              console.error("Error in run macro action:", error);
            }
          })();
        `;
      // Add more cases for other action types here as needed
      default:
        return "// Unknown Action";
    }
  };
  
  const parseActionType = script => {
    if (script.includes("canvas.animatePan")) return "camera";
    if (script.includes("setTimeout(resolve")) return "wait";
    if (script.includes("game.scenes.get")) return "switchScene";
    if (script.includes("canvas.tokens.get")) return "tokenMovement";
    if (script.includes("shakeScreen")) return "screenShake";
    if (script.includes("flashEffect")) return "screenFlash";
    // Add more conditions to identify other action types here as needed
    return "unknown";
  };
  
  const parseParamsFromScript = (script, type) => {
    const params = {};
    switch (type) {
      case "camera":
        params.x = parseFloat(script.match(/x: (\d+(\.\d+)?)/)[1]);
        params.y = parseFloat(script.match(/y: (\d+(\.\d+)?)/)[1]);
        params.scale = parseFloat(script.match(/scale: (\d+(\.\d+)?)/)[1]);
        params.duration = parseInt(script.match(/duration: (\d+)/)[1]);
        break;
      case "wait":
        params.duration = parseInt(script.match(/setTimeout\(resolve, (\d+)\)/)[1]);
        break;
      case "switchScene":
        params.sceneId = script.match(/game\.scenes\.get\("(.+?)"\)/)[1];
        break;
      case "tokenMovement":
        params.x = parseFloat(script.match(/x: (\d+(\.\d+)?)/)[1]);
        params.y = parseFloat(script.match(/y: (\d+(\.\d+)?)/)[1]);
        params.rotation = parseFloat(script.match(/rotation: (\d+(\.\d+)?)/)[1]);
        params.animatePan = script.includes("canvas.animatePan");
        params.teleport = script.includes("animate: false");
        break;
      case "screenShake":
        params.duration = parseInt(script.match(/duration: (\d+)/)[1]);
        params.speed = parseInt(script.match(/speed: (\d+)/)[1]);
        params.intensity = parseInt(script.match(/intensity: (\d+)/)[1]);
        break;
      case "screenFlash":
        params.duration = parseInt(script.match(/duration: (\d+)/)[1]);
        params.color = script.match(/backgroundColor: "(#\w+)"/)[1];
        params.opacity = parseFloat(script.match(/opacity: (\d(\.\d+)?)/)[1]);
        break;
      // Add more cases for other action types here as needed
      default:
        break;
    }
    return params;
  };
  
  const generateDescription = (type, script) => {
    const params = parseParamsFromScript(script, type);
    switch (type) {
      case "camera":
        return `Camera Position (Duration: ${params.duration}ms)`;
      case "wait":
        return `Wait for ${params.duration} ms`;
      case "switchScene":
        const scene = game.scenes.get(params.sceneId);
        const sceneName = scene ? scene.name : "Unknown Scene";
        return `Switch Scene to ${sceneName} (ID: ${params.sceneId})`;
      case "tokenMovement":
        return params.teleport
          ? `Token Teleport (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°)`
          : `Token Movement (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°, Pan: ${params.animatePan ? 'Yes' : 'No'})`;
      case "screenShake":
        return `Screen Shake (Duration: ${params.duration}ms, Speed: ${params.speed}, Intensity: ${params.intensity}px)`;
      case "screenFlash":
        return `Screen Flash (Color: ${params.color}, Opacity: ${params.opacity}, Duration: ${params.duration}ms)`;
      // Add more cases for other action types here as needed
      default:
        return "Unknown Action";
    }
  };  
  
  openInitialDialog();
