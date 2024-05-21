let cutsceneActions = [];

function openInitialDialog() {
  let d = new Dialog({
    title: "Cutscene Macro Maker",
    content: `
    <style>
        .cutscene-maker-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .cutscene-maker-button {
            text-align: center;
            padding: 5px;
            border: 1px solid #ccc;
            cursor: pointer;
        }
        .cutscene-maker-finish {
            grid-column: 1 / -1;
            text-align: center;
            padding: 5px;
            border: 1px solid #ccc;
            cursor: pointer;
        }
    </style>
    <div class="cutscene-maker-buttons">
        <div class="cutscene-maker-button" id="cameraButton">Camera</div>
        <div class="cutscene-maker-button" id="sceneButton">Switch Scene</div>
        <div class="cutscene-maker-button" id="movementButton">Token Movement</div>
        <div class="cutscene-maker-button" id="showhideButton">Show/Hide Token</div>
        <div class="cutscene-maker-button" id="chatButton">Chat</div>
        <div class="cutscene-maker-button" id="branchButton">Conditional Branch</div>
        <div class="cutscene-maker-button" id="flashButton">Screen Flash</div>
        <div class="cutscene-maker-button" id="shakeButton">Screen Shake</div>
        <div class="cutscene-maker-button" id="tileButton">Tile Movement</div>
        <div class="cutscene-maker-button" id="doorButton">Door State</div>
        <div class="cutscene-maker-button" id="lightButton">Light State</div>
        <div class="cutscene-maker-button" id="ambientButton">Ambient Sound State</div>
        <div class="cutscene-maker-button" id="imageButton">Show Image</div>
        <div class="cutscene-maker-button" id="animationButton">Play Animation</div>
        <div class="cutscene-maker-button" id="soundButton">Play Sound</div>
        <div class="cutscene-maker-button" id="playlistButton">Change Playlist</div>
        <div class="cutscene-maker-button" id="fadeoutButton">Fade Out</div>
        <div class="cutscene-maker-button" id="fadeinButton">Fade In</div>
        <div class="cutscene-maker-button" id="hideUIButton">Hide UI</div>
        <div class="cutscene-maker-button" id="showUIButton">Show UI</div>
        <div class="cutscene-maker-button" id="effectsButton">Weather/Particle Effects</div>
        <div class="cutscene-maker-button" id="roomKeyButton">Location Banner</div>
        <div class="cutscene-maker-button" id="macroButton">Run Macro</div>
        <div class="cutscene-maker-button" id="waitButton">Wait</div>
        <div class="cutscene-maker-finish" id="finishButton">Export Macro</div>
    </div>
    `,
    buttons: {},
    render: html => {
      const closeDialogAndExecute = actionFunction => {
        d.close();
        actionFunction();
      };
      html.find("#cameraButton").click(() => closeDialogAndExecute(addCameraPositionAction));
      html.find("#sceneButton").click(() => closeDialogAndExecute(addSwitchSceneAction));
      html.find("#chatButton").click(() => closeDialogAndExecute(addChatCommandAction));
      html.find("#movementButton").click(() => closeDialogAndExecute(addTokenMovementAction));
      html.find("#showhideButton").click(() => closeDialogAndExecute(addHideToggleAction));
      html.find("#branchButton").click(() => closeDialogAndExecute(addConditionalBranchAction));
      html.find("#flashButton").click(() => closeDialogAndExecute(addScreenFlashAction));
      html.find("#shakeButton").click(() => closeDialogAndExecute(addScreenShakeAction));
      html.find("#tileButton").click(() => closeDialogAndExecute(addTileMovementAction));
      html.find("#macroButton").click(() => closeDialogAndExecute(addRunMacroAction));
      html.find("#waitButton").click(() => closeDialogAndExecute(addWaitAction));
      html.find("#doorButton").click(() => closeDialogAndExecute(addDoorStateAction));
      html.find("#lightButton").click(() => closeDialogAndExecute(addLightStateAction));
      html.find("#ambientButton").click(() => closeDialogAndExecute(addAmbientSoundStateAction));
      html.find("#effectsButton").click(() => closeDialogAndExecute(addWeatherEffectAction));
      html.find("#imageButton").click(() => closeDialogAndExecute(addImageDisplayAction));
      html.find("#animationButton").click(() => closeDialogAndExecute(addAnimationAction));
      html.find("#soundButton").click(() => closeDialogAndExecute(addPlaySoundAction));
      html.find("#playlistButton").click(() => closeDialogAndExecute(addPlayPlaylistAction));
      html.find("#fadeoutButton").click(() => closeDialogAndExecute(addFadeOutAction));
      html.find("#fadeinButton").click(() => closeDialogAndExecute(addFadeInAction));
      html.find("#hideUIButton").click(() => closeDialogAndExecute(addHideUIAction));
      html.find("#showUIButton").click(() => closeDialogAndExecute(addShowUIAction));
      html.find("#roomKeyButton").click(() => closeDialogAndExecute(addRoomKeyAction));
      html.find("#finishButton").click(() => closeDialogAndExecute(outputCutsceneScript));
    }
  });
  d.render(true);
}

function addDialogAction(title, formContent, callback) {
  new Dialog({
    title: title,
    content: formContent,
    buttons: {
      ok: {
        label: "Add",
        callback: html => {
          try {
            callback(html);
            ui.notifications.info(`${title} action added to the cutscene.`);
          } catch (error) {
            console.error(`Error adding ${title} action:`, error);
            ui.notifications.error(`Failed to add ${title} action.`);
          }
          openInitialDialog();
        }
      },
      cancel: {
        label: "Cancel",
        callback: () => openInitialDialog()
      }
    },
    default: "ok"
  }).render(true);
}

function addCameraPositionAction() {
    addDialogAction(
      "Camera Position Action",
      `
        <form>
          <div class="form-group">
            <label for="panDuration">Pan Duration (in milliseconds):</label>
            <input type="number" id="panDuration" name="panDuration" value="1000" step="100" style="width: 100%;">
          </div>
        </form>
        <p>Current position and zoom level will be used.</p>
      `,
      html => {
        const duration = html.find("#panDuration").val();
        const viewPosition = canvas.scene._viewPosition;
        cutsceneActions.push(`
          // Camera Position Action
          // This script pans the camera to the specified position and zoom level over the given duration.
          (async function() {
            try {
              // Define the target position and zoom level.
              const targetPosition = {
                x: ${viewPosition.x}, // X-coordinate for the camera position
                y: ${viewPosition.y}, // Y-coordinate for the camera position
                scale: ${viewPosition.scale} // Zoom level for the camera
              };
              // Animate the camera pan to the target position.
              await canvas.animatePan({
                x: targetPosition.x,
                y: targetPosition.y,
                scale: targetPosition.scale,
                duration: ${duration} // Duration of the pan in milliseconds
              });
              // Wait for the duration to ensure the pan completes.
              await new Promise(resolve => setTimeout(resolve, ${duration}));
            } catch (error) {
              console.error("Error in camera position action:", error);
            }
          })();
        `.trim());
        ui.notifications.info("Camera position action added to the cutscene.");
      }
    );
  }  

  function addSwitchSceneAction() {
    addDialogAction(
      "Switch Scene",
      `
        <form>
          <div class="form-group">
            <label for="sceneId">Scene ID:</label>
            <input type="text" id="sceneId" name="sceneId" placeholder="Enter the scene ID here" style="width: 100%;">
          </div>
        </form>
        <p>Enter the ID of the scene you wish to switch to.</p>
      `,
      html => {
        const sceneId = html.find("#sceneId").val();
        cutsceneActions.push(`
          // Switch Scene Action
          // This script switches the view to the specified scene by its ID.
          (async function() {
            try {
              // Get the scene object using the provided scene ID.
              const scene = game.scenes.get("${sceneId}");
              if (scene) {
                // If the scene exists, switch the view to this scene.
                await scene.view();
                console.log("Switched to scene: " + scene.name); // Log the scene switch action.
              } else {
                console.error("Scene not found with ID: ${sceneId}"); // Error if the scene ID is not found.
              }
            } catch (error) {
              console.error("Error in scene switch action:", error);
            }
          })();
        `);
        ui.notifications.info("Scene switch action added to the cutscene script.");
      }
    );
  }  

  function addTokenMovementAction() {
    if (canvas.tokens.controlled.length !== 1) {
      ui.notifications.warn("Please select exactly one token.");
      openInitialDialog();
      return;
    }
    const selectedToken = canvas.tokens.controlled[0];
    addDialogAction(
      "Token Movement",
      `
        <p>Move the selected token to the new position, then click OK.</p>
        <form>
          <div class="form-group">
            <label for="animatePan">Enable Screen Panning:</label>
            <input type="checkbox" id="animatePan" name="animatePan" value="1" style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">Camera Panning.</p>
          </div>
          <div class="form-group">
            <label for="teleport">Teleport:</label>
            <input type="checkbox" id="teleport" name="teleport" style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">Instantly move to the new position without animation.</p>
          </div>
        </form>
      `,
      html => {
        const newPosition = { x: selectedToken.x, y: selectedToken.y };
        const animatePan = html.find("#animatePan")[0].checked;
        const teleport = html.find("#teleport")[0].checked;
        let tokenMovementScript;
        if (teleport) {
          tokenMovementScript = `
            // Token Teleport Action
            // This script instantly teleports the selected token to a new position without animation.
            (async function() {
              try {
                // Get the token object using its ID.
                const token = canvas.tokens.get("${selectedToken.id}");
                if (token) {
                  // Update the token's position without animation.
                  await token.document.update({ x: ${newPosition.x}, y: ${newPosition.y} }, { animate: false });
                }
              } catch (error) {
                console.error("Error in token teleport action:", error);
              }
            })();
          `;
        } else {
          tokenMovementScript = `
            // Token Movement Action
            // This script moves the selected token to a new position with animation.
            (async function() {
              try {
                // Get the token object using its ID.
                const token = canvas.tokens.get("${selectedToken.id}");
                if (token) {
                  // Update the token's position with animation.
                  await token.document.update({ x: ${newPosition.x}, y: ${newPosition.y} });
                  ${animatePan ? `
                  // Animate the camera pan to follow the token's new position.
                  await canvas.animatePan({ x: ${newPosition.x}, y: ${newPosition.y}, duration: 1000 });
                  ` : ""}
                }
                // Wait for a short duration to ensure the movement animation completes.
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (error) {
                console.error("Error in token movement action:", error);
              }
            })();
          `;
        }
        cutsceneActions.push(tokenMovementScript.trim());
        ui.notifications.info(`Token ${teleport ? "teleport" : "movement"} action added to the cutscene.`);
      }
    );
  }

  function addHideToggleAction() {
    if (canvas.tokens.controlled.length !== 1) {
      ui.notifications.warn("Please select exactly one token.");
      openInitialDialog();
      return;
    }
    const selectedToken = canvas.tokens.controlled[0];
    cutsceneActions.push(`
      // Show/Hide Token Action
      // This script toggles the visibility of the selected token.
      (async function() {
        try {
          // Get the token object using its ID.
          const token = canvas.tokens.get("${selectedToken.id}");
          if (token) {
            // Toggle the hidden property of the token.
            await token.document.update({ hidden: !token.data.hidden });
            console.log("Token visibility toggled: " + (!token.data.hidden ? "Visible" : "Hidden"));
          } else {
            console.error("Token not found with ID: ${selectedToken.id}");
          }
        } catch (error) {
          console.error("Error in show/hide token action:", error);
        }
      })();
    `);
    ui.notifications.info("Token show/hide action added to the cutscene script.");
    openInitialDialog();
  }

  function addChatCommandAction() {
    if (canvas.tokens.controlled.length !== 1) {
      ui.notifications.warn("Please select exactly one token.");
      openInitialDialog();
      return;
    }
    const selectedToken = canvas.tokens.controlled[0];
    addDialogAction(
      "Chat Command",
      `
        <form>
          <div class="form-group">
            <label for="messageContent">Message:</label>
            <input type="text" id="messageContent" name="messageContent" style="width: 100%;">
          </div>
        </form>
        <p>Enter the message you want the selected token to say in chat. This will be added to your cutscene script.</p>
      `,
      html => {
        const messageContent = html.find("#messageContent").val();
        cutsceneActions.push(`
          // Chat Command Action
          // This script makes the selected token say a specified message in chat.
          (async function() {
            try {
              // Define the speaker object with token and actor information.
              const speaker = { 
                alias: "${selectedToken.name}", // Token name as the alias
                token: "${selectedToken.id}", // Token ID
                actor: "${selectedToken.actor.id}" // Actor ID
              };
              // Define the message content.
              const content = "${messageContent.replace(/"/g, '\\"')}";
              // Create a chat message with the defined speaker and content.
              ChatMessage.create({ speaker, content });
            } catch (error) {
              console.error("Error in chat command action:", error);
            }
          })();
        `.trim());
        ui.notifications.info("Chat command action added to the cutscene script.");
      }
    );
  }

  function addConditionalBranchAction() {
    function renderDialog() {
      let dialogContent = `
        <style>
          .choice-input-set {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .choice-input-set input {
            flex: 1;
            margin-right: 5px;
          }
          #add-choice {
            margin-top: 10px;
          }
        </style>
        <div id="conditional-choices-container">
          <p>Add choices and corresponding macros. Use the '+' button to add more choices.</p>
          <div class="choice-input-set">
            <input type="text" placeholder="Choice Text" class="choice-text" style="margin-right: 5px;">
            <input type="text" placeholder="Macro Name" class="macro-name">
          </div>
        </div>
        <button type="button" id="add-choice">Add Choice</button>
      `;
  
      const d = new Dialog({
        title: "Configure Conditional Branch",
        content: dialogContent,
        buttons: {
          done: {
            icon: '<i class="fas fa-check"></i>',
            label: "Done",
            callback: html => {
              const choiceTexts = html.find(".choice-text").map(function () { return $(this).val(); }).get();
              const macroNames = html.find(".macro-name").map(function () { return $(this).val(); }).get();
  
              choices = choiceTexts.map((text, index) => ({ text, macro: macroNames[index] }));
  
              generateConditionalBranchScript();
            }
          },
          cancel: {
            label: "Cancel",
            callback: () => openInitialDialog()
          }
        },
        render: html => {
          html.find("#add-choice").click(() => {
            const container = html.find("#conditional-choices-container");
            container.append(`
              <div class="choice-input-set">
                <input type="text" placeholder="Choice Text" class="choice-text" style="margin-right: 5px;">
                <input type="text" placeholder="Macro Name" class="macro-name">
              </div>
            `);
          });
        }
      });
      d.render(true);
    }
  
    function generateConditionalBranchScript() {
      let scriptContent = `
        // Conditional Branch Action
        // This script creates a dialog with multiple choices, each executing a specified macro when selected.
        async function executeMacroByName(macroName) {
          try {
            // Find the macro by its name.
            const macro = game.macros.contents.find(m => m.name === macroName);
            if (macro) {
              // Execute the macro if found.
              await macro.execute();
            } else {
              console.error("Macro not found: " + macroName);
            }
          } catch (error) {
            console.error("Error executing macro:", error);
          }
        }
  
        // Create a new dialog with the defined choices.
        new Dialog({
          title: "Choose an Action",
          content: "<p>What would you like to do?</p>",
          buttons: {`;
  
      choices.forEach((choice, index) => {
        scriptContent += `
            'choice${index}': {
              label: "${choice.text}",
              callback: () => {
                // Execute the macro associated with this choice.
                executeMacroByName("${choice.macro}");
              }
            },`;
      });
  
      scriptContent += `
          },
          default: 'choice0'
        }).render(true);
      `;
  
      cutsceneActions.push(scriptContent);
      console.log("Conditional branch action added.");
      openInitialDialog();
    }
  
    renderDialog();
  }  

  function addRunMacroAction() {
    addDialogAction(
      "Run Macro Action",
      `
        <form>
          <div class="form-group">
            <label for="macroName">Macro Name:</label>
            <input type="text" id="macroName" name="macroName" placeholder="Enter macro name here" style="width: 100%;">
          </div>
        </form>
        <p>Enter the name of the macro you wish to run.</p>
      `,
      html => {
        const macroName = html.find("#macroName").val();
        cutsceneActions.push(`
          // Run Macro Action
          // This script runs the specified macro by its name.
          (async function() {
            try {
              // Find the macro by its name.
              const macro = game.macros.find(m => m.name === "${macroName}");
              if (macro) {
                // Execute the macro if found.
                await macro.execute();
                console.log("Executed macro: ${macroName}");
              } else {
                console.warn("Macro not found: ${macroName}");
              }
            } catch (error) {
              console.error("Error in run macro action:", error);
            }
          })();
        `.trim());
        ui.notifications.info("Run Macro action added to the cutscene script.");
      }
    );
  }
  
function addWaitAction() {
  addDialogAction(
    "Wait Duration",
    `
      <form>
        <div class="form-group">
          <label for="waitDuration">Enter wait duration in milliseconds:</label>
          <input type="number" id="waitDuration" name="waitDuration" min="0" step="100" value="1000" style="width: 100%;">
        </div>
      </form>
    `,
    html => {
      const duration = html.find("#waitDuration").val();
      cutsceneActions.push(`
        // Wait for specific duration in milliseconds. 
        await new Promise(resolve => setTimeout(resolve, ${duration}));
      `.trim());
    }
  );
}

function addScreenFlashAction() {
    addDialogAction(
      "Add Screen Flash Effect",
      `
        <form>
          <div class="form-group">
            <label for="flashColor">Flash Color (hex):</label>
            <input type="text" id="flashColor" name="flashColor" value="#FFFFFF" placeholder="#FFFFFF" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="flashOpacity">Opacity (0.0 - 1.0):</label>
            <input type="number" id="flashOpacity" name="flashOpacity" step="0.1" min="0.0" max="1.0" value="0.5" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="flashDuration">Duration (milliseconds):</label>
            <input type="number" id="flashDuration" name="flashDuration" step="100" min="100" value="1000" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const flashColor = html.find("#flashColor").val();
        const flashOpacity = parseFloat(html.find("#flashOpacity").val());
        const flashDuration = parseInt(html.find("#flashDuration").val());
        cutsceneActions.push(`
          // Screen Flash Action
          // This script creates a screen flash effect with the specified color, opacity, and duration.
          (function() {
            try {
              // Create a div element to cover the screen for the flash effect.
              const flashEffect = document.createElement("div");
              flashEffect.style.position = "fixed";
              flashEffect.style.left = 0;
              flashEffect.style.top = 0;
              flashEffect.style.width = "100vw";
              flashEffect.style.height = "100vh";
              flashEffect.style.backgroundColor = "${flashColor}"; // Set the flash color
              flashEffect.style.opacity = ${flashOpacity}; // Set the flash opacity
              flashEffect.style.pointerEvents = "none"; // Ensure the flash effect doesn't interfere with interactions
              flashEffect.style.zIndex = "10000"; // Ensure the flash effect is above all other elements
              document.body.appendChild(flashEffect);
  
              // Start the fade-out transition after a short delay.
              setTimeout(() => {
                flashEffect.style.transition = "opacity ${flashDuration}ms";
                flashEffect.style.opacity = 0;
              }, 50);
  
              // Remove the flash effect element after the transition completes.
              setTimeout(() => {
                flashEffect.remove();
              }, ${flashDuration} + 50);
            } catch (error) {
              console.error("Error in screen flash action:", error);
            }
          })();
        `);
        ui.notifications.info("Screen flash effect added to the cutscene script.");
      }
    );
  }
  
  function addScreenShakeAction() {
    addDialogAction(
      "Add Screen Shake Effect",
      `
        <form>
          <div class="form-group">
            <label for="shakeDuration">Duration (milliseconds):</label>
            <input type="number" id="shakeDuration" name="shakeDuration" value="1000" step="100" min="100" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="shakeSpeed">Speed (frequency of shakes):</label>
            <input type="number" id="shakeSpeed" name="shakeSpeed" value="10" step="1" min="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="shakeIntensity">Intensity (pixel displacement):</label>
            <input type="number" id="shakeIntensity" name="shakeIntensity" value="5" step="1" min="1" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const duration = parseInt(html.find("#shakeDuration").val());
        const speed = parseInt(html.find("#shakeSpeed").val());
        const intensity = parseInt(html.find("#shakeIntensity").val());
        cutsceneActions.push(`
          // Screen Shake Action
          // This script creates a screen shake effect with the specified duration, speed, and intensity.
          (function() {
            try {
              // Save the original transform style of the document body.
              const originalTransform = document.body.style.transform;
              let startTime = performance.now();
  
              // Function to perform the shaking effect.
              function shakeScreen(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = elapsedTime / ${duration}; // Calculate the progress as a fraction of the duration
  
                if (progress < 1) {
                  // Calculate the displacement using a sine wave for smooth shaking.
                  let displacement = ${intensity} * Math.sin(progress * ${speed} * 2 * Math.PI);
                  displacement *= 1 - progress; // Reduce the intensity over time
  
                  // Apply the displacement to the document body's transform style.
                  document.body.style.transform = \`translate(\${displacement}px, \${displacement}px)\`;
                  
                  // Continue the animation until the duration is complete.
                  requestAnimationFrame(shakeScreen);
                } else {
                  // Restore the original transform style once the shake effect is complete.
                  document.body.style.transform = originalTransform;
                }
              }
  
              // Start the shake effect animation.
              requestAnimationFrame(shakeScreen);
            } catch (error) {
              console.error("Error in screen shake action:", error);
            }
          })();
        `);
        ui.notifications.info("Screen shake effect added to the cutscene script.");
      }
    );
  }
  
  function addTileMovementAction() {
    if (canvas.tiles.controlled.length < 1) {
      ui.notifications.warn("Please select at least one tile.");
      openInitialDialog();
      return;
    }
  
    addDialogAction(
      "Tile Movement",
      `
        <p>Move the selected tiles to the new positions, then click OK.</p>
        <form>
          <div class="form-group">
            <label for="animate">Animate Movement:</label>
            <input type="checkbox" id="animate" name="animate" checked style="margin-top: 5px;">
            <p style="font-size: 0.8em; margin-top: 5px;">Check this if you want the tiles to move smoothly to their new positions.</p>
          </div>
        </form>
      `,
      html => {
        const animate = html.find("#animate")[0].checked;
        let tileMovementScript = `
          // Tile Movement Action
          // This script moves the selected tiles to their new positions.
          (async function() {
            try {
              // Update each selected tile's position.
              ${canvas.tiles.controlled.map(t => {
                return `
                // Move tile with ID: ${t.id}
                await canvas.tiles.get("${t.id}").document.update({ x: ${t.x}, y: ${t.y} }, { animate: ${animate} });`;
              }).join('\n')}
              // Wait for the movement animation to complete.
              await new Promise(resolve => setTimeout(resolve, canvas.tiles.controlled.length * 1000));
            } catch (error) {
              console.error("Error in tile movement action:", error);
            }
          })();
        `;
        cutsceneActions.push(tileMovementScript.trim());
        ui.notifications.info("Tile movement action added to the cutscene.");
      }
    );
  }
  
  function addDoorStateAction() {
    if (canvas.walls.controlled.length !== 1) {
      ui.notifications.warn("Please select exactly one door.");
      openInitialDialog();
      return;
    }
    const selectedWall = canvas.walls.controlled[0];
    if (!selectedWall.data.door) {
      ui.notifications.warn("The selected wall is not a door.");
      openInitialDialog();
      return;
    }
    new Dialog({
      title: "Door Options",
      content: "<p>Choose an action for the selected door:</p>",
      buttons: {
        openClose: {
          label: "Open/Close",
          callback: () => {
            cutsceneActions.push(`
              // Door Open/Close Action
              // This script toggles the open/close state of the selected door.
              (async function() {
                try {
                  // Get the door object using its ID.
                  const wall = canvas.walls.get("${selectedWall.id}");
                  if (wall) {
                    // Determine the new door state (open or closed).
                    let newState = wall.data.ds === CONST.WALL_DOOR_STATES.CLOSED ? CONST.WALL_DOOR_STATES.OPEN : CONST.WALL_DOOR_STATES.CLOSED;
                    // Update the door state.
                    await wall.document.update({ ds: newState });
                  }
                } catch (error) {
                  console.error("Error in door open/close action:", error);
                }
                // Wait for a short duration to ensure the state change completes.
                await new Promise(resolve => setTimeout(resolve, 1000));
              })();
            `.trim());
            ui.notifications.info("Door open/close toggle added to the cutscene script.");
            openInitialDialog();
          }
        },
        lockUnlock: {
          label: "Lock/Unlock",
          callback: () => {
            const isLocked = selectedWall.data.ds === CONST.WALL_DOOR_STATES.LOCKED;
            const newLockState = isLocked ? CONST.WALL_DOOR_STATES.CLOSED : CONST.WALL_DOOR_STATES.LOCKED;
            cutsceneActions.push(`
              // Door Lock/Unlock Action
              // This script toggles the lock/unlock state of the selected door.
              (async function() {
                try {
                  // Get the door object using its ID.
                  const wall = canvas.walls.get("${selectedWall.id}");
                  if (wall) {
                    // Update the lock state of the door.
                    await wall.document.update({ ds: ${newLockState} });
                  }
                } catch (error) {
                  console.error("Error in door lock/unlock action:", error);
                }
              })();
            `.trim());
            ui.notifications.info("Door lock/unlock toggle added to the cutscene script.");
            openInitialDialog();
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => openInitialDialog()
        }
      }
    }).render(true);
  }
  
  function addLightStateAction() {
    addDialogAction(
      "Light State Action",
      `
        <form>
          <div class="form-group">
            <label for="lightId">Light Source ID:</label>
            <input type="text" id="lightId" name="lightId" placeholder="Enter light source ID here" style="width: 100%;">
          </div>
        </form>
        <p>Enter the light source ID and choose to toggle its state in the cutscene.</p>
      `,
      html => {
        const lightId = html.find("#lightId").val();
        if (!lightId) {
          ui.notifications.warn("Please enter a light source ID.");
          return;
        }
        cutsceneActions.push(`
          // Light State Action
          // This script toggles the visibility of the specified light source.
          (async function() {
            try {
              // Get the light object using its ID.
              const light = canvas.lighting.get("${lightId}");
              if (light) {
                // Toggle the hidden property of the light.
                const newVisibility = !light.data.hidden;
                await light.document.update({ hidden: newVisibility });
                console.log("Light " + (newVisibility ? "enabled" : "disabled") + ".");
              } else {
                console.warn("Light source not found with ID: ${lightId}");
              }
            } catch (error) {
              console.error("Error in light state action:", error);
            }
          })();
        `);
        ui.notifications.info("Light toggle action added to the cutscene script.");
      }
    );
  }
  
  function addAmbientSoundStateAction() {
    addDialogAction(
      "Ambient Sound State Action",
      `
        <form>
          <div class="form-group">
            <label for="soundId">Ambient Sound ID:</label>
            <input type="text" id="soundId" name="soundId" placeholder="Enter ambient sound ID here" style="width: 100%;" autocomplete="off">
          </div>
        </form>
        <p>Toggle the on/off state of the specified ambient sound in your cutscene.</p>
      `,
      html => {
        const soundId = html.find("#soundId").val();
        const sound = canvas.scene.sounds.find(s => s.id === soundId);
        if (sound) {
          cutsceneActions.push(`
            // Ambient Sound State Action
            // This script toggles the on/off state of the specified ambient sound.
            (async function() {
              try {
                // Find the ambient sound by its ID.
                const sound = canvas.scene.sounds.find(s => s.id === "${soundId}");
                if (sound) {
                  // Toggle the hidden state of the ambient sound.
                  const currentHiddenState = sound.data.hidden;
                  await sound.update({ hidden: !currentHiddenState });
                  console.log("Ambient sound toggled: " + (!currentHiddenState ? "On" : "Off"));
                } else {
                  console.error("Ambient sound not found with ID: ${soundId}");
                }
              } catch (error) {
                console.error("Error in ambient sound state action:", error);
              }
            })();
          `);
          ui.notifications.info("Ambient sound toggle (On/Off) action added to the cutscene script.");
        } else {
          ui.notifications.error("Ambient sound not found with ID: " + soundId);
        }
      }
    );
  }
  
  function addWeatherEffectAction() {
    const weatherTypes = [{ name: "None", value: "none" }, { name: "Clouds", value: "clouds" }, { name: "Rain", value: "rain" }, { name: "Snow", value: "snow" }];
    const weatherOptions = weatherTypes.map(type => `<option value="${type.value}">${type.name}</option>`).join("");
    addDialogAction(
      "Add Weather Effect",
      `
        <form>
          <div class="form-group">
            <label for="weatherType">Weather Effect:</label>
            <select id="weatherType" name="weatherType" style="width: 100%;">${weatherOptions}</select>
          </div>
          <div class="form-group">
            <label for="density">Density:</label>
            <input type="number" id="density" name="density" step="0.01" min="0" max="1" value="0.5" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="speed">Speed:</label>
            <input type="number" id="speed" name="speed" step="0.1" min="0" value="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="scale">Scale:</label>
            <input type="number" id="scale" name="scale" step="0.1" min="0" value="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="tint">Tint (hex color):</label>
            <input type="text" id="tint" name="tint" value="#FFFFFF" placeholder="#FFFFFF" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="direction">Direction (degrees):</label>
            <input type="number" id="direction" name="direction" value="90" placeholder="90" step="1" min="0" max="360" value="0" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const selectedWeatherType = html.find("#weatherType").val();
        const density = parseFloat(html.find("#density").val());
        const speed = parseFloat(html.find("#speed").val());
        const scale = parseFloat(html.find("#scale").val());
        const tint = html.find("#tint").val();
        const direction = parseInt(html.find("#direction").val());
        cutsceneActions.push(`
          // Weather Effect Action
          // This script applies a weather effect with the specified parameters.
          Hooks.call("fxmaster.updateParticleEffects", [
            {
              type: "${selectedWeatherType}", // Type of weather effect (e.g., "rain", "snow")
              options: {
                density: ${density}, // Density of the weather effect particles
                speed: ${speed}, // Speed of the weather effect particles
                scale: ${scale}, // Scale of the weather effect particles
                tint: { value: "${tint}", apply: true }, // Tint color of the weather effect particles
                direction: ${direction} // Direction of the weather effect particles
              }
            }
          ]);
        `);
        ui.notifications.info("Weather effect added to the cutscene script.");
      }
    );
  }
  
  function addImageDisplayAction() {
    addDialogAction(
      "Add Image Display Action",
      `
        <form>
          <div class="form-group">
            <label for="imageUrl">Image URL:</label>
            <input type="text" id="imageUrl" name="imageUrl" placeholder="http://example.com/image.png" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const imageUrl = html.find("#imageUrl").val();
        if (imageUrl) {
          cutsceneActions.push(`
            // Image Display Action
            // This script displays an image from the specified URL in a dialog.
            (async function() {
              try {
                // Create and render a new dialog to display the image.
                new Dialog({
                  title: "Image Display",
                  content: \`
                    <div style="text-align: center;">
                      <img src="${imageUrl}" style="border: 0; width: auto; height: auto; max-width: 100%; max-height: 400px;" />
                    </div>\`,
                  buttons: {
                    close: {
                      label: "Close",
                      callback: () => {}
                    }
                  },
                  default: "close",
                  render: html => {
                    console.log("Displaying image to all players.");
                  }
                }).render(true);
              } catch (error) {
                console.error("Error in image display action:", error);
              }
            })();
          `);
          ui.notifications.info("Image display action added to the cutscene script.");
        } else {
          ui.notifications.warn("No URL provided. Action not added.");
        }
      }
    );
  }
  
  function addAnimationAction() {
    if (canvas.tokens.controlled.length === 0) {
      ui.notifications.warn("Please select a token.");
      openInitialDialog();
      return;
    }
    const sourceToken = canvas.tokens.controlled[0];
    let targetedTokens = Array.from(game.user.targets);
    let targetToken = targetedTokens.length > 0 ? targetedTokens[0] : null;
  
    addDialogAction(
      "Add Animation",
      `
        <form>
          <div class="form-group">
            <label for="animationUrl">Animation URL:</label>
            <input type="text" id="animationUrl" name="animationUrl" placeholder="https://example.com/animation.webm" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="scale">Scale:</label>
            <input type="number" id="scale" name="scale" value="1" step="0.1" min="0.1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="rotation">Rotation (degrees):</label>
            <input type="number" id="rotation" name="rotation" value="0" step="1" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="duration">Duration (ms):</label>
            <input type="number" id="duration" name="duration" value="1000" step="100" min="100" style="width: 100%;">
          </div>
        </form>
      `,
      html => {
        const animationUrl = html.find("#animationUrl").val();
        const scale = parseFloat(html.find("#scale").val());
        const rotation = parseInt(html.find("#rotation").val());
        const duration = parseInt(html.find("#duration").val());
        let sequencerScript = `
          // Animation Action
          // This script plays an animation from the specified URL. It either attaches the animation to a target token
          // or stretches the animation from the selected token to a target token, depending on the presence of a target token.
          new Sequence()`;
  
        if (targetToken) {
          sequencerScript += `
            // Stretch the animation from the selected token to the target token.
            .effect()
            .file("${animationUrl}") // URL of the animation file
            .attachTo(canvas.tokens.get("${sourceToken.id}")) // Attach the animation to the selected token
            .stretchTo(canvas.tokens.get("${targetToken.id}")) // Stretch the animation to the target token
            .scale(${scale}) // Scale of the animation
            .rotate(${rotation}) // Rotation of the animation in degrees
            .duration(${duration}) // Duration of the animation in milliseconds
            .play();`;
        } else {
          sequencerScript += `
            // Play the animation at the location of the selected token.
            .effect()
            .file("${animationUrl}") // URL of the animation file
            .atLocation(canvas.tokens.get("${sourceToken.id}")) // Play the animation at the selected token's location
            .scale(${scale}) // Scale of the animation
            .rotate(${rotation}) // Rotation of the animation in degrees
            .duration(${duration}) // Duration of the animation in milliseconds
            .play();`;
        }
  
        cutsceneActions.push(sequencerScript);
        ui.notifications.info("Animation action added to the cutscene script.");
      }
    );
  }  

  function addPlaySoundAction() {
    addDialogAction(
      "Play Sound",
      `
        <form>
          <div class="form-group">
            <label for="soundUrl">Sound File URL:</label>
            <input type="text" id="soundUrl" name="soundUrl" placeholder="http://example.com/sound.mp3" style="width: 100%;">
          </div>
        </form>
        <p>Enter the URL of the sound file you wish to play.</p>
      `,
      html => {
        const soundUrl = html.find("#soundUrl").val();
        cutsceneActions.push(`
          // Play Sound Action
          // This script plays a sound from the specified URL.
          (async function() {
            try {
              // Play the sound using the appropriate method based on the Foundry VTT version.
              if (typeof AudioHelper !== "undefined" && AudioHelper.play) {
                // Foundry VTT 0.7.x and later.
                AudioHelper.play({ src: "${soundUrl}", volume: 0.8, autoplay: true, loop: false }, true);
              } else if (typeof AudioHelper === "undefined" && game.audio) {
                // Foundry VTT 0.6.x.
                game.audio.play({ src: "${soundUrl}", volume: 0.8, autoplay: true, loop: false });
              } else {
                console.error("Sound playing is not supported in this version of Foundry VTT.");
              }
              console.log("Playing sound from URL: ${soundUrl}");
            } catch (error) {
              console.error("Error in play sound action:", error);
            }
          })();
        `.trim());
        ui.notifications.info("Sound play action added to the cutscene script.");
      }
    );
  }
  
  function addPlayPlaylistAction() {
    addDialogAction(
      "Play Specific Playlist",
      `
        <form>
          <div class="form-group">
            <label for="playlistName">Playlist Name:</label>
            <input type="text" id="playlistName" name="playlistName" placeholder="Enter the playlist name here" style="width: 100%;">
          </div>
        </form>
        <p>Enter the name of the playlist you wish to start. This will stop all currently playing audio first.</p>
      `,
      html => {
        const playlistName = html.find("#playlistName").val();
        cutsceneActions.push(`
          // Play Playlist Action
          // This script stops all currently playing audio and starts playing the specified playlist by its name.
          (async function() {
            try {
              // Get all playlists.
              const playlists = game.playlists.contents;
  
              // Stop all currently playing playlists.
              const playingPlaylists = playlists.filter(p => p.playing);
              for (let i = 0; i < playingPlaylists.length; i++) {
                await playingPlaylists[i].stopAll();
              }
  
              // Wait a short duration to ensure all audio has stopped.
              await new Promise(resolve => setTimeout(resolve, 100));
  
              // Find the new playlist by name and play it.
              let newPlaylist = playlists.find(p => p.name === "${playlistName}");
              if (newPlaylist) {
                await newPlaylist.playAll();
                console.log("Playing playlist: ${playlistName}");
              } else {
                console.error("Playlist '${playlistName}' not found.");
              }
            } catch (error) {
              console.error("Error in play playlist action:", error);
            }
          })();
        `);
        ui.notifications.info("Playlist action (stop all and play) added to the cutscene script.");
      }
    );
  }
  
  function addFadeOutAction() {
    addDialogAction(
      "Fade Out Settings",
      `
        <form>
          <div class="form-group">
            <label for="fadeDuration">Fade Duration (in milliseconds):</label>
            <input type="number" id="fadeDuration" name="fadeDuration" value="2000" step="100" style="width: 100%;">
          </div>
        </form>
        <p>The screen will fade to black over the specified duration.</p>
      `,
      html => {
        const fadeDuration = html.find("#fadeDuration").val();
        cutsceneActions.push(`
          // Fade Out Action
          // This script fades the screen to black over the specified duration.
          (async function() {
            try {
              // Get the canvas element to apply the fade effect.
              const canvasElement = document.querySelector("canvas#board");
  
              // Apply the transition style for the fade effect.
              canvasElement.style.transition = "filter ${fadeDuration}ms ease-in-out";
              // Set the filter to brightness(0) to create the fade to black effect.
              canvasElement.style.filter = "brightness(0)";
  
              // Wait for the fade duration to complete the effect.
              await new Promise(resolve => setTimeout(resolve, ${fadeDuration}));
              console.log("Screen faded out over ${fadeDuration}ms.");
            } catch (error) {
              console.error("Error in fade out action:", error);
            }
          })();
        `);
        ui.notifications.info("Fade-out effect added to the cutscene script.");
      }
    );
  }
  
  function addFadeInAction() {
    addDialogAction(
      "Fade In Settings",
      `
        <form>
          <div class="form-group">
            <label for="fadeDuration">Fade Duration (in milliseconds):</label>
            <input type="number" id="fadeDuration" name="fadeDuration" value="2000" step="100" style="width: 100%;">
          </div>
        </form>
        <p>The screen will fade from black to normal over the specified duration.</p>
      `,
      html => {
        const fadeDuration = html.find("#fadeDuration").val();
        cutsceneActions.push(`
          // Fade In Action
          // This script fades the screen from black to normal over the specified duration.
          (async function() {
            try {
              // Get the canvas element to apply the fade effect.
              const canvasElement = document.querySelector("canvas#board");
  
              // Apply the transition style for the fade effect.
              canvasElement.style.transition = "filter ${fadeDuration}ms ease-in-out";
              // Set the filter to brightness(1) to remove the fade to black effect.
              canvasElement.style.filter = "brightness(1)";
  
              // Wait for the fade duration to complete the effect.
              await new Promise(resolve => setTimeout(resolve, ${fadeDuration}));
              console.log("Screen faded in over ${fadeDuration}ms.");
            } catch (error) {
              console.error("Error in fade in action:", error);
            }
          })();
        `);
        ui.notifications.info("Fade-in effect added to the cutscene script.");
      }
    );
  }
  
  function addHideUIAction() {
    addDialogAction(
      "Hide UI Settings",
      `
        <form>
          <div class="form-group">
            <label for="duration">Transition Duration (in milliseconds):</label>
            <input type="number" id="duration" name="duration" value="500" step="100" style="width: 100%;">
          </div>
        </form>
        <p>The UI will slide off screen over the specified duration.</p>
      `,
      html => {
        const duration = html.find("#duration").val();
        cutsceneActions.push(`
          // Hide UI Action
          // This script hides the UI elements by sliding them off-screen over the specified duration.
          (async function() {
            try {
              // Define the UI elements to hide.
              const uiSelectors = ["#ui-left", "#ui-top", "#taskbar", "#ui-right", "#players", "#hotbar"];
              
              // Apply the transition style and hide each UI element.
              uiSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                  element.style.transition = 'transform ${duration}ms ease, opacity ${duration}ms ease';
                  element.style.opacity = '0';
                }
              });
  
              // Wait for the transition duration to complete the effect.
              await new Promise(resolve => setTimeout(resolve, ${duration}));
              console.log("UI elements hidden over ${duration}ms.");
            } catch (error) {
              console.error("Error in hide UI action:", error);
            }
          })();
        `);
        ui.notifications.info("UI hide action added to the cutscene script.");
      }
    );
  }
  
  function addShowUIAction() {
    addDialogAction(
      "Show UI Settings",
      `
        <form>
          <div class="form-group">
            <label for="duration">Transition Duration (in milliseconds):</label>
            <input type="number" id="duration" name="duration" value="500" step="100" style="width: 100%;">
          </div>
        </form>
        <p>The UI will slide back on screen over the specified duration.</p>
      `,
      html => {
        const duration = html.find("#duration").val();
        cutsceneActions.push(`
          // Show UI Action
          // This script shows the UI elements by sliding them back on-screen over the specified duration.
          (async function() {
            try {
              // Define the UI elements to show.
              const uiSelectors = ["#ui-left", "#ui-top", "#taskbar", "#ui-right", "#players", "#hotbar"];
              
              // Apply the transition style and show each UI element.
              uiSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                  element.style.transition = 'transform ${duration}ms ease, opacity ${duration}ms ease';
                  element.style.opacity = '1';
                }
              });
  
              // Wait for the transition duration to complete the effect.
              await new Promise(resolve => setTimeout(resolve, ${duration}));
              console.log("UI elements shown over ${duration}ms.");
            } catch (error) {
              console.error("Error in show UI action:", error);
            }
          })();
        `);
        ui.notifications.info("UI show action added to the cutscene script.");
      }
    );
  }
  
  function addRoomKeyAction() {
    addDialogAction(
      "Room-Key Action",
      `
        <form>
          <div class="form-group">
            <label for="roomName">Room Name:</label>
            <input type="text" id="roomName" name="roomName" style="width: 100%;">
          </div>
          <div class="form-group">
            <label for="roomDescription">Description:</label>
            <textarea id="roomDescription" name="roomDescription" rows="4" style="width: 100%;"></textarea>
          </div>
        </form>
      `,
      html => {
        const roomName = html.find("#roomName").val();
        const description = html.find("#roomDescription").val();
        const imageUrl = "https://assets.forge-vtt.com/5eaf7c1286c5c77a61b3654f/Header-BG.png";
        cutsceneActions.push(`
          // Room Key Action
          // This script displays a room key banner with a specified room name and description.
          (async function() {
            try {
              // Create a div element to display the room key banner.
              let header = document.createElement('div');
              header.style.position = 'fixed';
              header.style.top = '20%';
              header.style.left = '50%';
              header.style.transform = 'translate(-50%, -50%)';
              header.style.width = 'auto';
              header.style.minWidth = '400px'; 
              header.style.height = '150px'; 
              header.style.padding = '4px';
              header.style.zIndex = 100;
              header.style.borderRadius = '10px';
              header.style.backgroundImage = 'url(${imageUrl})'; // Background image for the banner
              header.style.backgroundSize = 'contain'; 
              header.style.backgroundRepeat = 'no-repeat'; 
              header.style.color = 'white'; 
              header.style.display = 'flex';
              header.style.flexDirection = 'column';
              header.style.justifyContent = 'flex-start'; 
              header.style.alignItems = 'center'; 
              header.style.fontSize = '2.5em';
              header.style.opacity = 0;
              header.style.transition = 'opacity 1s';
              header.style.fontFamily = 'Modesto Condensed';
              header.style.color = '#c5a589';
              header.innerHTML = '<strong>${roomName}</strong> ${description}'; // Room name and description
  
              // Append the banner to the document body.
              document.body.appendChild(header);
  
              // Fade in the banner.
              setTimeout(() => header.style.opacity = 1, 100);
  
              // Fade out and remove the banner after a delay.
              setTimeout(() => {
                header.style.opacity = 0;
                setTimeout(() => header.remove(), 1000); 
              }, 5000);
              console.log("Room key banner displayed with room name: ${roomName} and description: ${description}");
            } catch (error) {
              console.error("Error in room key action:", error);
            }
          })();
        `);
        ui.notifications.info("Room Key added to the cutscene script.");
      }
    );
  }
  
function outputCutsceneScript() {
  new Dialog({
    title: "Cutscene Script",
    content: `
      <p>Here's your cutscene script. Copy and paste it into a new macro to run it, or make edits directly here.</p>
      <textarea id="cutsceneScriptOutput" style="width: 100%; height: 200px;">${cutsceneActions.join("\n\n")}</textarea>
      <p><button id="copyButton">Copy to Clipboard</button></p>
    `,
    buttons: {
      testRun: {
        label: "Test Run",
        callback: html => {
          const scriptToRun = html.find("#cutsceneScriptOutput").val();
          const asyncScript = `(async () => { ${scriptToRun} })();`;

          try {
            new Function(asyncScript)();
            ui.notifications.info("Test run executed successfully.");
            cutsceneActions = scriptToRun.split("\n\n").filter(action => action.trim() !== "");  // Save the updated script
            outputCutsceneScript();
          } catch (error) {
            console.error("Error executing cutscene script: ", error);
            ui.notifications.error("Error executing cutscene script. Check the console for details.");
          }

          return false;
        }
      },
      edit: {
        label: "Edit",
        callback: html => {
          const updatedScript = html.find("#cutsceneScriptOutput").val();
          cutsceneActions = updatedScript.split("\n\n").filter(action => action.trim() !== "");
          openInitialDialog();
        }
      },
      close: {
        label: "Close"
      }
    },
    render: html => {
      html.find("#copyButton").click(() => {
        const textarea = html.find("#cutsceneScriptOutput");
        textarea.select();
        document.execCommand("copy");
        ui.notifications.info("Script copied to clipboard!");
      });
    }
  }).render(true);
}

openInitialDialog();
