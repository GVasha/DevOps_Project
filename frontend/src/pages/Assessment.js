import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  CameraIcon, 
  SparklesIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { uploadAPI, assessmentAPI, getFileUrl } from '../services/api';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Assessment = () => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Details, 3: Analysis, 4: Results

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const handleImageUpload = async (files) => {
    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      formData.append('image', files[0].file);

      const response = await uploadAPI.uploadSingle(formData);
      const uploadedFile = response.data.file;

      setUploadedImage(uploadedFile);
      setStep(2);
      
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAnalysis = async (formData) => {
    try {
      setAnalysisLoading(true);
      setStep(3);

      const analysisData = {
        imageUrl: uploadedImage.url,
        description: formData.description,
        location: formData.location
      };

      const response = await assessmentAPI.analyzeImage(analysisData);
      setAnalysisResult(response.data.assessment);
      console.log(response.data)
      setStep(4);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setStep(2); // Go back to details step
      throw new Error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const startNewAssessment = () => {
    setStep(1);
    setUploadedImage(null);
    setAnalysisResult(null);
    reset();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none':
        return 'text-green-600 bg-green-50';
      case 'minor':
        return 'text-yellow-600 bg-yellow-50';
      case 'moderate':
        return 'text-orange-600 bg-orange-50';
      case 'severe':
        return 'text-red-600 bg-red-50';
      case 'total loss':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 8) return 'text-green-600';
    if (confidence >= 6) return 'text-yellow-600';
    if (confidence >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Car Damage Assessment</h1>
        <p className="mt-2 text-gray-600">
          Upload photos of your vehicle to get an AI-powered damage assessment
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Upload Photo', icon: CameraIcon },
            { step: 2, title: 'Add Details', icon: ClockIcon },
            { step: 3, title: 'AI Analysis', icon: SparklesIcon },
            { step: 4, title: 'Results', icon: CheckCircleIcon }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200
                ${step >= item.step 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                {step > item.step ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-3 text-sm font-medium ${
                step >= item.step ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {item.title}
              </span>
              {index < 3 && (
                <div className={`ml-4 w-16 h-0.5 ${
                  step > item.step ? 'bg-primary-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Image Upload */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Upload Vehicle Photos</h2>
            <p className="text-gray-600">
              Take clear photos of the damaged areas from multiple angles
            </p>
          </div>

          <ImageUpload
            onUpload={handleImageUpload}
            loading={uploadLoading}
            maxFiles={1}
          />

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Photography Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Take photos in good lighting conditions</li>
              <li>• Capture the entire damaged area</li>
              <li>• Include reference objects for scale</li>
              <li>• Avoid shadows and reflections</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Additional Details */}
      {step === 2 && uploadedImage && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Assessment Details</h2>
            <p className="text-gray-600">
              Provide additional context for more accurate analysis
            </p>
          </div>

          {/* Uploaded Image Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Uploaded Image</h3>
            <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getFileUrl(uploadedImage.url)}
                alt="Uploaded vehicle"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', uploadedImage.url);
                  console.error('Computed URL:', getFileUrl(uploadedImage.url));
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(handleAnalysis)} className="space-y-6">
            <Input
              label="Incident Description"
              type="text"
              placeholder="Briefly describe what happened (e.g., 'Rear-ended at traffic light')"
              error={errors.description?.message}
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description must not exceed 500 characters'
                }
              })}
            />

            <Input
              label="Location"
              type="text"
              placeholder="Where did the incident occur? (Optional)"
              error={errors.location?.message}
              {...register('location', {
                maxLength: {
                  value: 100,
                  message: 'Location must not exceed 100 characters'
                }
              })}
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={analysisLoading}
                icon={SparklesIcon}
              >
                Start AI Analysis
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Analysis in Progress */}
      {step === 3 && (
        <div className="card text-center">
          <div className="py-12">
            <LoadingSpinner size="xlarge" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              AI Analysis in Progress
            </h2>
            <p className="mt-2 text-gray-600">
              Our AI is analyzing your vehicle damage. This may take a few moments...
            </p>
            <div className="mt-6 max-w-md mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  We're using advanced computer vision to identify damage patterns, 
                  assess severity, and estimate repair costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Analysis Results */}
      {step === 4 && analysisResult && (
        <div className="space-y-6">
          {/* Analysis Summary Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Assessment Results</h2>
              <p className="text-gray-600">
                AI-powered analysis of your vehicle damage
              </p>
            </div>

            {/* Analyzed Image */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Analyzed Image</h3>
              <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getFileUrl(uploadedImage.url)}
                  alt="Analyzed vehicle"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Analysis Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Severity */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Damage Severity</label>
                <div className={`mt-2 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                  getSeverityColor(analysisResult.aiAnalysis?.analysis?.severity)
                }`}>
                  {analysisResult.aiAnalysis?.analysis?.severity || 'Unknown'}
                </div>
              </div>

              {/* Confidence */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence Level</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className={`text-2xl font-bold ${
                    getConfidenceColor(analysisResult.aiAnalysis?.analysis?.confidence)
                  }`}>
                    {analysisResult.aiAnalysis?.analysis?.confidence || 0}/10
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(analysisResult.aiAnalysis?.analysis?.confidence || 0) * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cost Category */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimated Cost</label>
                <div className="mt-2">
                  <div className={`text-lg font-bold ${
                    analysisResult.aiAnalysis?.analysis?.costCategory === 'Very High' ? 'text-red-600' :
                    analysisResult.aiAnalysis?.analysis?.costCategory === 'High' ? 'text-orange-600' :
                    analysisResult.aiAnalysis?.analysis?.costCategory === 'Medium' ? 'text-yellow-600' :
                    analysisResult.aiAnalysis?.analysis?.costCategory === 'Low' ? 'text-green-600' :
                    'text-gray-900'
                  }`}>
                    {analysisResult.aiAnalysis?.analysis?.costCategory || 'Unknown'}
                  </div>
                  {analysisResult.aiAnalysis?.analysis?.costRange && (
                    <div className="text-sm font-semibold text-gray-700 mt-1">
                      {analysisResult.aiAnalysis.analysis.costRange}
                    </div>
                  )}
                </div>
              </div>

              {/* Damage Types */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Damage Types</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysisResult.aiAnalysis?.analysis?.damageTypes && analysisResult.aiAnalysis.analysis.damageTypes.length > 0 ? (
                    analysisResult.aiAnalysis.analysis.damageTypes.map((type, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200"
                      >
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No damage types identified</span>
                  )}
                </div>
              </div>

              {/* Affected Areas */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Affected Areas</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysisResult.aiAnalysis?.analysis?.affectedAreas && analysisResult.aiAnalysis.analysis.affectedAreas.length > 0 ? (
                    analysisResult.aiAnalysis.analysis.affectedAreas.map((area, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200"
                      >
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No affected areas identified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            {analysisResult.aiAnalysis?.analysis?.summary && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Analysis Summary</h3>
                <p className="text-sm text-gray-600">
                  {analysisResult.aiAnalysis.analysis.summary}
                </p>
              </div>
            )}

            {/* Safety Concerns */}
            {analysisResult.aiAnalysis?.analysis?.safetyConcerns && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Safety Notice</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      {Array.isArray(analysisResult.aiAnalysis.analysis.safetyConcerns)
                        ? analysisResult.aiAnalysis.analysis.safetyConcerns.join(', ')
                        : analysisResult.aiAnalysis.analysis.safetyConcerns}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Info */}
            <div className="mt-4 text-xs text-gray-500">
              Analysis provided by: {analysisResult.aiAnalysis?.provider || 'AI Service'}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                onClick={() => {/* Navigate to create claim */}}
              >
                Create Insurance Claim
              </Button>
              <Button
                variant="secondary"
                onClick={startNewAssessment}
              >
                New Assessment
              </Button>
              <Button
                variant="ghost"
                onClick={() => {/* Navigate to assessments history */}}
              >
                View All Assessments
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
