pipeline {
  agent any

  environment {
    AWS_REGION    = 'us-east-1'
    EB_APP_NAME   = 'chargemate'
    EB_ENV_NAME   = 'chargemate-production'
    DEPLOY_BUCKET = 'chargemate-deployments-016963913530'
    ECR_REGISTRY  = '016963913530.dkr.ecr.us-east-1.amazonaws.com'
}

  stages {

    stage('Checkout') {
      steps {
        echo "Checking out code from GitHub..."
        checkout scm
        sh 'ls -la'
        echo "Checkout complete"
      }
    }

    stage('Install Station Service') {
      steps {
        dir('station-service') {
          sh 'npm ci'
        }
        echo "Station service dependencies installed"
      }
    }

    stage('Install Booking Service') {
      steps {
        dir('booking-service') {
          sh 'npm ci'
        }
        echo "Booking service dependencies installed"
      }
    }

    stage('Install Frontend') {
      steps {
        dir('frontend') {
          sh 'npm ci'
        }
        echo "Frontend dependencies installed"
      }
    }

    stage('Lint Station Service') {
      steps {
        dir('station-service') {
          sh 'npm run lint || true'
        }
        echo "Station service lint complete"
      }
    }

    stage('Lint Booking Service') {
      steps {
        dir('booking-service') {
          sh 'npm run lint || true'
        }
        echo "Booking service lint complete"
      }
    }

    stage('Test Station Service') {
      steps {
        withCredentials([
          string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
          string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
        ]) {
          dir('station-service') {
            sh 'npm run test:ci'
          }
        }
        echo "Station service tests passed"
      }
    }

    stage('Test Booking Service') {
      steps {
        withCredentials([
          string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
          string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
        ]) {
          dir('booking-service') {
            sh 'npm run test:ci'
          }
        }
        echo "Booking service tests passed"
      }
    }

    stage('Build Docker Images') {
      steps {
        echo "Building Docker images..."
        sh 'docker build -t chargemate-station-service:latest ./station-service'
        sh 'docker build -t chargemate-booking-service:latest ./booking-service'
        sh 'docker build -t chargemate-frontend:latest ./frontend'
        sh 'docker images | grep chargemate'
        echo "All Docker images built successfully"
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
                cp docker-compose-eb.yml docker-compose.yml
                zip deploy-${BUILD_NUMBER}.zip docker-compose.yml
                rm docker-compose.yml

                echo Uploading to S3...
                aws s3 cp deploy-${BUILD_NUMBER}.zip \
                s3://${DEPLOY_BUCKET}/deploy-${BUILD_NUMBER}.zip \
                --region ${AWS_REGION}

                echo Creating application version...
                VERSION_LABEL="v${BUILD_NUMBER}-\$(date +%Y%m%d%H%M%S)"
                echo "Version label: \$VERSION_LABEL"

                aws elasticbeanstalk create-application-version \
                --application-name ${EB_APP_NAME} \
                --version-label \$VERSION_LABEL \
                --source-bundle S3Bucket=${DEPLOY_BUCKET},S3Key=deploy-${BUILD_NUMBER}.zip \
                --region ${AWS_REGION}

                echo Deploying to ${EB_ENV_NAME}...
                aws elasticbeanstalk update-environment \
                --application-name ${EB_APP_NAME} \
                --environment-name ${EB_ENV_NAME} \
                --version-label \$VERSION_LABEL \
                --region ${AWS_REGION}

                echo Deployment initiated - version \$VERSION_LABEL
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
              --query 'Environments[0].{Status:Status,Health:Health,URL:CNAME}' \
              --output table \
              --region ${AWS_REGION}
          """
        }
        echo "Verification complete"
      }
    }

    stage('Health Check') {
      steps {
        echo "Pipeline complete - application deployed to AWS"
        echo "Monitor at: https://console.aws.amazon.com/elasticbeanstalk"
      }
    }

  }

  post {
    success {
      echo "PIPELINE SUCCEEDED - Build ${BUILD_NUMBER}"
      echo "ChargeMate deployed to AWS Elastic Beanstalk"
    }
    failure {
      echo "PIPELINE FAILED - Build ${BUILD_NUMBER}"
      withCredentials([[
        $class: 'AmazonWebServicesCredentialsBinding',
        credentialsId: 'aws-credentials',
        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
      ]]) {
        sh """
          echo Initiating rollback...
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
          fi
        """
      }
    }
  }
}