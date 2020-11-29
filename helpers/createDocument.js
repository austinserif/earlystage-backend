/** 
 * Takes a new user object with basic information, and fits it into 
 * a json schema that includes other necessary fields for later on in 
 * the userflow
 */
const createUserDocument = ({ name, email, password, isAdmin, verificationCode }) => {
    const now = new Date();
    return {
        email,
        account: {
            name,
            password,
            isVerified: false,
            verificationCode,
            isAdmin,
        },
        workspaces: [],
        questions: [],
        metadata: {
            lastModified: now,
            createdDate: now
        }
    }
}

const createQuestionDocument = ({question, category, email}) => {
    const now = new Date();
    return {
        category,
        question,
        isPreset: false,
        userEmail: email,
        answerFormat: null,
        metadata: {
            lastModified: now,
            createdDate: now
        }
    }
}

const createWorkspaceDocument = ({email, name, domain}) => {
    const now = new Date();
    return {
        userEmail: email,
        entity: {
            name,
            domain
        },
        components: [],
        metadata: {
            lastModified: now,
            createdDate: now
        }
    }
}

const createPresetQuestionDocument = ({question, category}) => {
    const now = new Date();
    return {
        category,
        question,
        isPreset: true,
        answerFormat: null,
        metadata: {
            lastModified: now,
            createdDate: now
        }
    }
}

const createComponentDocument = ({questionId, workspaceId, answer}) => {
    const now = new Date();
    return {
        questionId,
        workspaceId,
        answer,
        readiness: 'draft',
        metadata: {
            lastModified: now,
            createdDate: now
        }
    }
}

module.exports = { 
    createUserDocument, 
    createComponentDocument, 
    createQuestionDocument, 
    createPresetQuestionDocument,
    createWorkspaceDocument
};
