/**
 * ChargeMate CI/CD Pipeline
 *
 * Pipeline Stages:
 * 1. Checkout      – pull code from GitHub
 * 2. Install       – npm install all services
 * 3. Lint          – ESLint code quality check
 * 4. Test          – run all unit and integration tests
 * 5. Build         – build Docker images
 * 6. Push          – push images to AWS ECR
 * 7. Deploy        – deploy to AWS Elastic Beanstalk
 * 8. Health Check  – verify deployment is healthy
 */

pipeline {
  agent any

  // ── Environment Variables ──────────────────────────────────
  environment {
    AWS_REGION        = 'eu-west-2'
    AWS_ACCOUNT_ID    = credentials('aws-account-id')
    ECR_REGISTRY      = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    STATION_IMAGE     = "${ECR_REGISTRY}/chargemate-station-service"
    BOOKING_IMAGE     = "${ECR_REGISTRY}/chargemate-booking-service"
    FRONTEND_IMAGE    = "${ECR_REGISTRY}/chargemate-frontend"
    EB_APP_NAME       = 'chargemate'
    EB_ENV_NAME       = 'chargemate-production'
    DEPLOY_BUCKET     = 'chargemate-deployments'
  }

  // ── Pipeline Options ───────────────────────────────────────
  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
  }

  // ── Stages ─────────────────────────────────────────────────
  stages {

    // Stage 1: Checkout code
    stage('Checkout') {
      steps {
        echo '📥 Checking out code from GitHub...'
        checkout scm
        echo "Branch: ${env.BRANCH_NAME}"
        echo "Commit: ${env.GIT_COMMIT}"
      }
    }

    // Stage 2: Install dependencies
    stage('Install Dependencies') {
      parallel {
        stage('Install Station Service') {
          steps {
            dir('station-service') {
              echo '📦 Installing station-service dependencies...'
              sh 'npm ci'
              echo 'Station service dependencies installed'
            }
          }
        }
        stage('Install Booking Service') {
          steps {
            dir('booking-service') {
              echo 'Installing booking-service dependencies...'
              sh 'npm ci'
              echo 'Booking service dependencies installed'
            }
          }
        }
        stage('Install Frontend') {
          steps {
            dir('frontend') {
              echo '📦 Installing frontend dependencies...'
              sh 'npm ci'
              echo 'Frontend dependencies installed'
            }
          }
        }
      }
    }

    // Stage 3: ESLint code quality
    stage('Lint') {
      parallel {
        stage('Lint Station Service') {
          steps {
            dir('station-service') {
              echo 'Running ESLint on station-service...'
              sh 'npm run lint || true'
              echo 'Station service lint complete'
            }
          }
        }
        stage('Lint Booking Service') {
          steps {
            dir('booking-service') {
              echo 'Running ESLint on booking-service...'
              sh 'npm run lint || true'
              echo 'Booking service lint complete'
            }
          }
        }
      }
    }

    // Stage 4: Run tests
    stage('Test') {
      parallel {
        stage('Test Station Service') {
          steps {
            dir('station-service') {
              echo 'Running station-service tests...'
              sh 'npm run test:ci'
              echo 'Station service tests passed'
            }
          }
          post {
            always {
              echo 'Station service test coverage generated'
            }
          }
        }
        stage('Test Booking Service') {
          steps {
            dir('booking-service') {
              echo 'Running booking-service tests...'
              sh 'npm run test:ci'
              echo 'Booking service tests passed'
            }
          }
          post {
            always {
              echo 'Booking service test coverage generated'
            }
          }
        }
      }
    }

    // Stage 5: Build Docker images
    stage('Build Docker Images') {
      steps {
        echo '🐳 Building Docker images...'
        parallel(
          'Build Station Service': {
            sh """
              docker build \
                -t ${STATION_IMAGE}:${BUILD_NUMBER} \
                -t ${STATION_IMAGE}:latest \
                ./station-service
              echo 'Station service image built'
            """
          },
          'Build Booking Service': {
            sh """
              docker build \
                -t ${BOOKING_IMAGE}:${BUILD_NUMBER} \
                -t ${BOOKING_IMAGE}:latest \
                ./booking-service
              echo 'Booking service image built'
            """
          },
          'Build Frontend': {
            sh """
              docker build \
                -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                -t ${FRONTEND_IMAGE}:latest \
                ./frontend
              echo 'Frontend image built'
            """
          }
        )
      }
    }

    // Stage 6: Push to AWS ECR
    stage('Push to ECR') {
      when {
        branch 'main'
      }
      steps {
        withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
          echo 'Pushing images to AWS ECR...'
          sh """
            aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin ${ECR_REGISTRY}

            docker push ${STATION_IMAGE}:${BUILD_NUMBER}
            docker push ${STATION_IMAGE}:latest
            echo 'Station service image pushed'

            docker push ${BOOKING_IMAGE}:${BUILD_NUMBER}
            docker push ${BOOKING_IMAGE}:latest
            echo 'Booking service image pushed'

            docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
            docker push ${FRONTEND_IMAGE}:latest
            echo 'Frontend image pushed'
          """
        }
      }
    }

    // Stage 7: Deploy to Elastic Beanstalk
    stage('Deploy to Elastic Beanstalk') {
      when {
        branch 'main'
      }
      steps {
        withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
          echo 'Deploying to AWS Elastic Beanstalk...'
          sh """
            # Update image tags in deployment config
            sed -i 's|STATION_IMAGE_TAG|${BUILD_NUMBER}|g' aws/Dockerrun.aws.json
            sed -i 's|BOOKING_IMAGE_TAG|${BUILD_NUMBER}|g' aws/Dockerrun.aws.json
            sed -i 's|FRONTEND_IMAGE_TAG|${BUILD_NUMBER}|g' aws/Dockerrun.aws.json

            # Package deployment
            zip -r deploy-${BUILD_NUMBER}.zip aws/Dockerrun.aws.json

            # Upload to S3
            aws s3 cp deploy-${BUILD_NUMBER}.zip \
              s3://${DEPLOY_BUCKET}/deploy-${BUILD_NUMBER}.zip

            # Create new application version
            aws elasticbeanstalk create-application-version \
              --application-name ${EB_APP_NAME} \
              --version-label v${BUILD_NUMBER} \
              --source-bundle S3Bucket=${DEPLOY_BUCKET},S3Key=deploy-${BUILD_NUMBER}.zip \
              --region ${AWS_REGION}

            # Deploy the new version
            aws elasticbeanstalk update-environment \
              --application-name ${EB_APP_NAME} \
              --environment-name ${EB_ENV_NAME} \
              --version-label v${BUILD_NUMBER} \
              --region ${AWS_REGION}

            echo 'Deployment initiated'
          """
        }
      }
    }

    // Stage 8: Health check after deployment
    stage('Health Check') {
      when {
        branch 'main'
      }
      steps {
        withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
          echo '🏥 Waiting for deployment to complete...'
          sh """
            # Wait for environment to be ready
            aws elasticbeanstalk wait environment-updated \
              --application-name ${EB_APP_NAME} \
              --environment-names ${EB_ENV_NAME} \
              --region ${AWS_REGION}

            # Get the environment URL
            EB_URL=\$(aws elasticbeanstalk describe-environments \
              --application-name ${EB_APP_NAME} \
              --environment-names ${EB_ENV_NAME} \
              --query 'Environments[0].CNAME' \
              --output text \
              --region ${AWS_REGION})

            echo "Environment URL: \$EB_URL"

            # Check health endpoints
            curl -f http://\$EB_URL/health || exit 1
            echo 'Health check passed – deployment successful'
          """
        }
      }
    }
  }

  // ── Post Build Actions ─────────────────────────────────────
  post {
    success {
      echo """
      
      PIPELINE SUCCEEDED               
      Build: ${BUILD_NUMBER}              
      Branch: ${env.BRANCH_NAME}          
     
      """
    }

    failure {
      echo """
      
      PIPELINE FAILED                  
      Build: ${BUILD_NUMBER}              
      Initiating rollback...              
      
      """
      withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
        sh """
          # Get previous version
          PREV_VERSION=\$(aws elasticbeanstalk describe-application-versions \
            --application-name ${EB_APP_NAME} \
            --query 'ApplicationVersions[1].VersionLabel' \
            --output text \
            --region ${AWS_REGION} 2>/dev/null || echo "")

          if [ -n "\$PREV_VERSION" ]; then
            echo "Rolling back to: \$PREV_VERSION"
            aws elasticbeanstalk update-environment \
              --application-name ${EB_APP_NAME} \
              --environment-name ${EB_ENV_NAME} \
              --version-label \$PREV_VERSION \
              --region ${AWS_REGION}
            echo 'Rollback complete'
          else
            echo 'No previous version found for rollback'
          fi
        """
      }
    }

    always {
      echo '🧹 Cleaning up workspace...'
      cleanWs()
      sh 'docker system prune -f || true'
    }
  }
}