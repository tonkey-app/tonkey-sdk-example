pipeline {
    agent { label 'linux' }
    tools { nodejs '18.18.0' }
    options {
        disableRestartFromStage()
        disableConcurrentBuilds(abortPrevious: true)
    }
    stages {
        stage('prepare env') {
            parallel {
                stage('set repo name') {
                    steps {
                        script {
                            def repoParse = (GIT_URL =~ /FDC-AI\/[a-zA-Z-]+|tonkey-app\/[a-zA-Z-]+/)
                            env.REPO = repoParse [0]
                        }
                    }
                }
                stage('staging') {
                    when {
                        branch 'staging'
                    }
                    steps {
                        configFileProvider([configFile(fileId: 'staging-env', variable: 'MY_PROPS')]) {
                            script {
                                sh 'cp ${MY_PROPS} ./.env'
                                def props = readProperties file: "${MY_PROPS}"
                                env.NETLIFY_SITE_ID = props.NETLIFY_SITE_ID
                            }
                        }
                    }
                }
                stage('production') {
                    when {
                        branch 'production'
                    }
                    steps {
                        configFileProvider([configFile(fileId: 'prod-env', variable: 'MY_PROPS')]) {
                            script {
                                sh 'cp ${MY_PROPS} ./.env'
                                def props = readProperties file: "${MY_PROPS}"
                                env.NETLIFY_SITE_ID = props.NETLIFY_SITE_ID
                            }
                        }
                    }
                }
                stage('other') {
                    when {
                        not {
                            anyOf {
                                branch 'staging'
                                branch 'production'
                            }
                        }
                    }
                    steps {
                        configFileProvider([configFile(fileId: 'develop-env', variable: 'MY_PROPS')]) {
                            script {
                                sh 'cp ${MY_PROPS} ./.env.local'
                                def props = readProperties file: "${MY_PROPS}"
                                env.NETLIFY_SITE_ID = props.NETLIFY_SITE_ID
                            }
                        }
                    }
                }
            }
        }
        stage('install package') {
            steps {
                sh 'yarn'
            }
        }

        stage('Build') {
            steps {
                sh 'yarn build'
            }
        }

        stage('Test') {
            steps {
                sh 'yarn lint'
                sh 'yarn lint:css'
            }
        }

        stage('Deploy') {
            parallel {
                stage('other') {
                    when {
                        not {
                            anyOf {
                                branch 'develop'
                                branch 'staging'
                                branch 'production'
                            }
                        }
                    }
                    steps {
                        script {
                            if (env.BRANCH_NAME.startsWith('PR')) {
                                withCredentials([string(credentialsId: 'd7d4ae84-c4ca-4c9b-8c65-cf632f5b38f3', variable: 'NETLIFY_AUTH_TOKEN'), string(credentialsId: '63e2f6e4-ee39-43be-9757-7ffee68ba087', variable: 'GITHUB_AUTH')]) {
                                    script {
                                        sh '''
                                            OUTPUT=$(netlify deploy --build -m "$CHANGE_BRANCH $CHANGE_TITLE")
                                            NETLIFY_URL=$(echo "$OUTPUT" | grep -Eo '(http|https)://[a-zA-Z0-9./?=_-]*(--)[a-zA-Z0-9./?=_-]*')
                                            MESSAGE="This pull request is being automatically deployed to Netlify.\n\n ✅ Preview: $NETLIFY_URL\n"
                                            JSON=$(jo body="$MESSAGE")
                                            curl -H "Authorization: token $GITHUB_AUTH" -X POST -d "$JSON" https://api.github.com/repos/$REPO/issues/$CHANGE_ID/comments
                                        '''
                                    }
                                }
                            }
                            else {
                                withCredentials([string(credentialsId: 'd7d4ae84-c4ca-4c9b-8c65-cf632f5b38f3', variable: 'NETLIFY_AUTH_TOKEN')]) {
                                    script {
                                        sh 'netlify deploy --build -m "$BRANCH_NAME #$GIT_COMMIT"'
                                    }
                                }
                            }
                        }
                    }
                }
                stage('Production') {
                    when {
                        anyOf {
                            branch 'develop'
                            branch 'staging'
                            branch 'production'
                        }
                    }
                    steps {
                        withCredentials([string(credentialsId: 'd7d4ae84-c4ca-4c9b-8c65-cf632f5b38f3', variable: 'NETLIFY_AUTH_TOKEN')]) {
                            script {
                                sh 'netlify deploy --build --prod -m "$BRANCH_NAME #$GIT_COMMIT"'
                            }
                        }
                    }
                }
            }
        }

        stage('CleanWorkspace') {
            steps {
                cleanWs()
            }
        }
    }
    post {
        failure {
            script {
                switch (env.BRANCH_NAME) {
                    case 'develop': slackSend color: 'danger', message: "@tech ${env.REPO} develop build failed. \nBuild log: ${env.RUN_DISPLAY_URL}"; break
                    case 'staging': slackSend color: 'danger', message: "@tech ${env.REPO} staging build failed. \nBuild log: ${env.RUN_DISPLAY_URL}"; break
                    case 'production': slackSend color: 'danger', message: "@tech ${env.REPO} production build failed. \nBuild log: ${env.RUN_DISPLAY_URL}"; break
                }
            }
        }
    }
}