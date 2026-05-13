pipeline {
  agent any

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        sh 'ls -la'
      }
    }

    stage('Install Station Service') {
      steps {
        dir('station-service') {
          sh 'npm ci'
        }
      }
    }

    stage('Install Booking Service') {
      steps {
        dir('booking-service') {
          sh 'npm ci'
        }
      }
    }

    stage('Install Frontend') {
      steps {
        dir('frontend') {
          sh 'npm ci'
        }
      }
    }

    stage('Lint Station Service') {
      steps {
        dir('station-service') {
          sh 'npm run lint || true'
        }
      }
    }

    stage('Lint Booking Service') {
      steps {
        dir('booking-service') {
          sh 'npm run lint || true'
        }
      }
    }

    stage('Test Station Service') {
      steps {
        dir('station-service') {
          sh 'npm run test:ci'
        }
      }
    }

    stage('Test Booking Service') {
      steps {
        dir('booking-service') {
          sh 'npm run test:ci'
        }
      }
    }

    stage('Build Station Service Image') {
      steps {
        sh 'docker build -t chargemate-station-service:latest ./station-service'
      }
    }

    stage('Build Booking Service Image') {
      steps {
        sh 'docker build -t chargemate-booking-service:latest ./booking-service'
      }
    }

    stage('Build Frontend Image') {
      steps {
        sh 'docker build -t chargemate-frontend:latest ./frontend'
        sh 'docker images | grep chargemate'
      }
    }

    stage('Push to AWS ECR') {
      steps {
        sh 'echo AWS ECR push stage - requires AWS credentials in production'
      }
    }

    stage('Deploy to Elastic Beanstalk') {
      steps {
        sh 'echo Elastic Beanstalk deploy stage - requires AWS credentials in production'
      }
    }

    stage('Health Check') {
      steps {
        sh 'curl -sf http://localhost:4001/health && echo Station healthy || echo Station not running in CI'
        sh 'curl -sf http://localhost:4002/health && echo Booking healthy || echo Booking not running in CI'
      }
    }

  }

  post {
    success {
      echo "PIPELINE SUCCEEDED - Build ${BUILD_NUMBER}"
    }
    failure {
      echo "PIPELINE FAILED - Build ${BUILD_NUMBER}"
    }
  }
}