var wizardTemplate = (map.getDisplayController().getWizardTemplate('UserTemplate'));
                            if ((typeof wizardTemplate) != 'function') {
                                throw 'Expecting Proposal Wizard';
                            }

                            var wizard = wizardTemplate(map, {});

                            wizard.buildDefaultAndShow();