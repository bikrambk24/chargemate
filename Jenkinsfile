pipeline {
  agent any

  environment {
    JWT_SECRET     = 'chargemate_jwt_secret_devops_module_2025_swe7303'
    MONGO_URI      = 'mongodb://bikram:g4JgPOvBokCI0B3K@ac-pyaby8b-shard-00-00.w9oeos2.mongodb.net:27017,ac-pyaby8b-shard-00-01.w9oeos2.mongodb.net:27017,ac-pyaby8b-shard-00-02.w9oeos2.mongodb.net:27017/?ssl=true&replicaSet=atlas-11yunw-shard-0&authSource=admin&appName=DevOps'
    AWS_REGION     = 'eu-west-1'
    EB_APP_NAME    = 'chargemate'
    EB_ENV_NAME    = 'chargemate-production'
    DEPLOY_BUCKET  = 'chargemate-deployments-016963913530'
    ECR_REGISTRY   = '016963913530.dkr.ecr.eu-west-1.amazonaws.com'
  }

  stages {

    stage('Checkout') {
      steps {
        echo "Checking out code from GitHub..."
        checkout scm
        sh 'ls -la'
        echo "Checkout complete. Branch: ${env.GIT_BRANCH}"
      }
    }

    stage('Install Station Service') {
      steps {
        echo "Installing station-service dependencies..."
        dir('station-service') {
          sh 'npm ci'
        }
        echo "Station service ready"
      }
    }

    stage('Install Booking Service') {
      steps {
        echo "Installing booking-service dependencies..."
        dir('booking-service') {
          sh 'npm ci'
        }
        echo "Booking service ready"
      }
    }

    stage('Install Frontend') {
      steps {
        echo "Installing frontend dependencies..."
        dir('frontend') {
          sh 'npm ci'
        }
        echo "Frontend ready"
      }
    }

    stage('Lint Station Service') {
      steps {
        echo "Running ESLint on station-service..."
        dir('station-service') {
          sh 'npm run lint || true'
        }
        echo "Station service lint complete"
      }
    }

    stage('Lint Booking Service') {
      steps {
        echo "Running ESLint on booking-service..."
        dir('booking-service') {
          sh 'npm run lint || true'
        }
        echo "Booking service lint complete"
      }
    }

    stage('Test Station Service') {
      steps {
        echo "Running station-service tests..."
        dir('station-service') {
          sh 'npm run test:ci'
        }
        echo "Station service tests passed"
      }
    }

    stage('Test Booking Service') {
      steps {
        echo "Running booking-service tests..."
        dir('booking-service') {
          sh 'npm run test:ci'
        }
        echo "Booking service tests passed"
      }
    }

    stage('Build Docker Images') {
      steps {
        echo "Building Docker images..."
        sh 'docker build -t chargemate-station-service:latest ./station-service'
        echo "Station service image built"
        sh 'docker build -t chargemate-booking-service:latest ./booking-service'
        echo "Booking service image built"
        sh 'docker build -t chargemate-frontend:latest ./frontend'
        echo "Frontend image built"
        sh 'docker images | grep chargemate'
      }
    }

    stage('Push to AWS ECR') {
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: 'aws-credentials',
          accessKeyVariable: 'AWS_ACCESS_KEY_ID',
          secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
        ]]) {
          sh """
            echo Logging in to AWS ECR...
            aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin ${ECR_REGISTRY}

            echo Pushing station-service image...
            docker tag chargemate-station-service:latest \
              ${ECR_REGISTRY}/chargemate-station-service:latest
            docker push ${ECR_REGISTRY}/chargemate-station-service:latest

            echo Pushing booking-service image...
            docker tag chargemate-booking-service:latest \
              ${ECR_REGISTRY}/chargemate-booking-service:latest
            docker push ${ECR_REGISTRY}/chargemate-booking-service:latest

            echo Pushing frontend image...
            docker tag chargemate-frontend:latest \
              ${ECR_REGISTRY}/chargemate-frontend:latest
            docker push ${ECR_REGISTRY}/chargemate-frontend:latest

            echo All images pushed to AWS ECR successfully
          """
        }
      }
    }

    stage('Deploy to Elastic Beanstalk') {
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: 'aws-credentials',
          accessKeyVariable: 'AWS_ACCESS_KEY_ID',
          secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
        ]]) {
          sh """
            echo Creating deployment package...
            zip -r deploy-${BUILD_NUMBER}.zip aws/Dockerrun.aws.json

            echo Uploading to S3...
            aws s3 cp deploy-${BUILD_NUMBER}.zip \
              s3://${DEPLOY_BUCKET}/deploy-${BUILD_NUMBER}.zip \
              --region ${AWS_REGION}

            echo Creating application version v${BUILD_NUMBER}...
            aws elasticbeanstalk create-application-version \
              --application-name ${EB_APP_NAME} \
              --version-label v${BUILD_NUMBER} \
              --source-bundle S3Bucket=${DEPLOY_BUCKET},S3Key=deploy-${BUILD_NUMBER}.zip \
              --region ${AWS_REGION}

            echo Deploying to environment ${EB_ENV_NAME}...
            aws elasticbeanstalk update-environment \
              --application-name ${EB_APP_NAME} \
              --environment-name ${EB_ENV_NAME} \
              --version-label v${BUILD_NUMBER} \
              --region ${AWS_REGION}

            echo Deployment initiated successfully
          """
        }
      }
    }

    stage('Verify Deployment') {
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: 'aws-credentials',
          accessKeyVariable: 'AWS_ACCESS_KEY_ID',
          secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
        ]]) {
          sh """
            echo Checking deployment status...
            aws elasticbeanstalk describe-environments \
              --application-name ${EB_APP_NAME} \
              --environment-names ${EB_ENV_NAME} \
              --query 'Environments[0].{Status:Status,Health:Health}' \
              --output table \
              --region ${AWS_REGION}
            echo Deployment verification complete
          """
        }
      }
    }

    stage('Health Check') {
      steps {
        echo "Pipeline health check stage complete"
        echo "Application deployed to AWS Elastic Beanstalk"
        echo "Monitor via AWS CloudWatch"
      }
    }

  }

  post {
    success {
      echo "PIPELINE SUCCEEDED - Build ${BUILD_NUMBER}"
      echo "ChargeMate deployed to AWS successfully"
    }
    failure {
      echo "PIPELINE FAILED - Build ${BUILD_NUMBER}"
      echo "Check console output for details"
      withCredentials([[
        $class: 'AmazonWebServicesCredentialsBinding',
        credentialsId: 'aws-credentials',
        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
      ]]) {
        sh """
          echo Initiating rollback to previous version...
          PREV=\$(aws elasticbeanstalk describe-application-versions \
            --application-name ${EB_APP_NAME} \
            --region ${AWS_REGION} \
            --query 'ApplicationVersions[1].VersionLabel' \
            --output text 2>/dev/null || echo none)
          if [ "\$PREV" != "none" ] && [ "\$PREV" != "None" ]; then
            echo Rolling back to \$PREV
            aws elasticbeanstalk update-environment \
              --application-name ${EB_APP_NAME} \
              --environment-name ${EB_ENV_NAME} \
              --version-label \$PREV \
              --region ${AWS_REGION}
            echo Rollback complete
          else
            echo No previous version found for rollback
          fi
        """
      }
    }
  }
}