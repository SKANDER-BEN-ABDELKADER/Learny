const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_VIDEO_PATH = process.argv[2] || './test-video.mp4';

async function testVideoAnalysis() {
  console.log('🧪 Testing Video Analysis Feature');
  console.log('================================');
  
  // Check if test video exists
  if (!fs.existsSync(TEST_VIDEO_PATH)) {
    console.error(`❌ Test video not found: ${TEST_VIDEO_PATH}`);
    console.log('Please provide a video file path as an argument or place a test-video.mp4 in the current directory');
    return;
  }

  try {
    // Step 1: Check if Ollama is running
    console.log('\n1️⃣ Checking Ollama service...');
    try {
      await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
      console.log('✅ Ollama service is running');
    } catch (error) {
      console.error('❌ Ollama service is not running');
      console.log('Please start Ollama: ollama serve');
      return;
    }

    // Step 2: Check if required models are available
    console.log('\n2️⃣ Checking required models...');
    try {
      const modelsResponse = await axios.get('http://localhost:11434/api/tags');
      const models = modelsResponse.data.models || [];
      const modelNames = models.map(m => m.name);
      
      if (modelNames.includes('whisper')) {
        console.log('✅ Whisper model found');
      } else {
        console.log('❌ Whisper model not found. Download with: ollama pull whisper');
        return;
      }
      
      if (modelNames.includes('llama3')) {
        console.log('✅ Llama3 model found');
      } else {
        console.log('❌ Llama3 model not found. Download with: ollama pull llama3');
        return;
      }
    } catch (error) {
      console.error('❌ Failed to check models:', error.message);
      return;
    }

    // Step 3: Check if FFmpeg is available
    console.log('\n3️⃣ Checking FFmpeg...');
    const { exec } = require('child_process');
    exec('ffmpeg -version', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ FFmpeg not found. Please install FFmpeg');
        return;
      }
      console.log('✅ FFmpeg is available');
      
      // Continue with the test after FFmpeg check
      runVideoAnalysisTest();
    });

  } catch (error) {
    console.error('❌ Setup check failed:', error.message);
  }
}

async function runVideoAnalysisTest() {
  try {
    console.log('\n4️⃣ Testing video analysis...');
    
    // Create form data with test video
    const formData = new FormData();
    formData.append('title', 'Test Course - Video Analysis');
    formData.append('description', 'This is a test course to verify video analysis functionality');
    formData.append('category', 'Testing');
    formData.append('level', 'BEGINNER');
    formData.append('price', '0');
    formData.append('instructorId', '1');
    formData.append('video', fs.createReadStream(TEST_VIDEO_PATH));

    // Make API request
    const response = await axios.post(`${API_BASE_URL}/course`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer test-token' // You'll need a real token for actual testing
      },
      timeout: 120000 // 2 minutes timeout for video processing
    });

    const course = response.data;
    
    console.log('✅ Course created successfully!');
    console.log('\n📊 Analysis Results:');
    console.log('===================');
    
    if (course.whatYouWillLearn && course.whatYouWillLearn.length > 0) {
      console.log('\n🎯 What You Will Learn:');
      course.whatYouWillLearn.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`);
      });
    } else {
      console.log('\n❌ No learning objectives extracted');
    }
    
    if (course.requirements && course.requirements.length > 0) {
      console.log('\n📋 Requirements:');
      course.requirements.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`);
      });
    } else {
      console.log('\n❌ No requirements extracted');
    }
    
    console.log('\n🎉 Video analysis test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Video analysis test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testVideoAnalysis(); 