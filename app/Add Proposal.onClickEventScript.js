var wizardTemplate = (map.getDisplayController().getWizardTemplate('ProposalTemplate'));
        if ((typeof wizardTemplate) != 'function') {
            throw 'Expecting Proposal Wizard';
        }


        var wizard = wizardTemplate((new Proposal()), {});

       wizard.buildDefaultAndShow();