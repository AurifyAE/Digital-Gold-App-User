import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CreditCard, AlertCircle, CheckCircle, Eye, Edit, Clock, XCircle } from 'lucide-react';
import { addKyc, getKyc, updateKyc } from '../../api/api';

const Kyc = () => {
    const [formData, setFormData] = useState({
        emirates_id: '',
        passport_no: '',
        source_of_funds: '',
    });

    const [files, setFiles] = useState({
        emirates_id_front_img: null,
        emirates_id_back_img: null,
        visa_copy: null,
    });

    const [previews, setPreviews] = useState({
        emirates_id_front_img: null,
        emirates_id_back_img: null,
        visa_copy: null,
    });

    const [fileLoading, setFileLoading] = useState({
        emirates_id_front_img: false,
        emirates_id_back_img: false,
        visa_copy: false,
    });

    const [loading, setLoading] = useState(false);
    const [fetchingKyc, setFetchingKyc] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [existingKyc, setExistingKyc] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const fileInputRefs = {
        emirates_id_front_img: useRef(null),
        emirates_id_back_img: useRef(null),
        visa_copy: useRef(null),
    };

    // Fetch existing KYC data on component mount
    useEffect(() => {
        fetchExistingKyc();
    }, []);

    const fetchExistingKyc = async () => {
        setFetchingKyc(true);
        try {
            const response = await getKyc();
            if (!response.success && response.data) {
                setExistingKyc(response.data.data);
                // Populate form with existing data
                setFormData({
                    emirates_id: response.data.data.emirates_id || '',
                    passport_no: response.data.data.passport_no || '',
                    source_of_funds: response.data.data.source_of_funds || '',
                });
                setRejectionReason(response.data.data.reason || '');
                // Preload existing image URLs into previews
                setPreviews({
                    emirates_id_front_img: response.data.data.emirates_id_front_img
                        ? getAuthenticatedImageUrl(response.data.data.emirates_id_front_img)
                        : null,
                    emirates_id_back_img: response.data.data.emirates_id_back_img
                        ? getAuthenticatedImageUrl(response.data.data.emirates_id_back_img)
                        : null,
                    visa_copy: response.data.data.visa_copy
                        ? getAuthenticatedImageUrl(response.data.data.visa_copy)
                        : null,
                });
            } else {
                setExistingKyc(null);
            }
        } catch (error) {
            console.error('Error fetching KYC:', error);
            if (error.response && error.response.status === 401) {
                setMessage({ 
                    type: 'error', 
                    text: 'Please log in to view your KYC information.' 
                });
            } else if (error.response && error.response.data && error.response.data.message) {
                if (error.response.data.message.includes('Authentication failed')) {
                    setMessage({ 
                        type: 'error', 
                        text: 'Authentication failed. Please log in again.' 
                    });
                } else {
                    setMessage({ 
                        type: 'error', 
                        text: error.response.data.message 
                    });
                }
            } else {
                setExistingKyc(null);
            }
        } finally {
            setFetchingKyc(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) {
            setMessage({ type: 'error', text: `No file selected for ${fieldName}` });
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Please upload only JPEG or PNG images' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size should be less than 5MB' });
            return;
        }

        setFileLoading((prev) => ({ ...prev, [fieldName]: true }));

        const reader = new FileReader();
        reader.onload = (event) => {
            setFiles((prev) => ({ ...prev, [fieldName]: file }));
            setPreviews((prev) => ({ ...prev, [fieldName]: event.target.result }));
            setMessage({ type: '', text: '' });
            setFileLoading((prev) => ({ ...prev, [fieldName]: false }));
        };
        reader.onerror = () => {
            setMessage({ type: 'error', text: `Failed to read file for ${fieldName}` });
            setFileLoading((prev) => ({ ...prev, [fieldName]: false }));
        };
        reader.readAsDataURL(file);
    };

    const removeFile = (fieldName) => {
        setFiles((prev) => ({ ...prev, [fieldName]: null }));
        setPreviews((prev) => ({ ...prev, [fieldName]: null }));
        if (fileInputRefs[fieldName].current) fileInputRefs[fieldName].current.value = '';
    };

    const validateForm = () => {
        if (!formData.emirates_id.trim()) {
            setMessage({ type: 'error', text: 'Emirates ID number is required' });
            return false;
        }
        if (!formData.source_of_funds.trim()) {
            setMessage({ type: 'error', text: 'Source of funds is required' });
            return false;
        }
        // For new submissions or rejected KYC updates, images are required
        if (!existingKyc || existingKyc.status === 'rejected') {
            if (!(files.emirates_id_front_img instanceof File) && !previews.emirates_id_front_img) {
                setMessage({ type: 'error', text: 'Valid Emirates ID front image is required' });
                return false;
            }
            if (!(files.emirates_id_back_img instanceof File) && !previews.emirates_id_back_img) {
                setMessage({ type: 'error', text: 'Valid Emirates ID back image is required' });
                return false;
            }
        }
        return true;
    };

    const extractErrorFromHtml = (htmlString) => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;
            const preElement = tempDiv.querySelector('pre');
            if (preElement) {
                const errorText = preElement.textContent || preElement.innerText;
                const lines = errorText.split('\n');
                const errorLine = lines[0];
                return errorLine.replace(/^Error:\s*/, '');
            }
            return null;
        } catch (e) {
            console.error('Error parsing HTML response:', e);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('emirates_id', formData.emirates_id);
            formDataToSend.append('source_of_funds', formData.source_of_funds);

            if (formData.passport_no.trim()) {
                formDataToSend.append('passport_no', formData.passport_no);
            }
            if (files.emirates_id_front_img instanceof File) {
                formDataToSend.append('emirates_id_front_img', files.emirates_id_front_img);
            }
            if (files.emirates_id_back_img instanceof File) {
                formDataToSend.append('emirates_id_back_img', files.emirates_id_back_img);
            }
            if (files.visa_copy instanceof File) {
                formDataToSend.append('visa_copy', files.visa_copy);
            }

            let response;
            if (existingKyc && existingKyc.status === 'rejected') {
                formDataToSend.append('kyc_id', existingKyc._id);
                response = await updateKyc(formDataToSend);
                setMessage({ type: 'success', text: 'KYC updated successfully!' });
            } else {
                response = await addKyc(formDataToSend);
                setMessage({ type: 'success', text: 'KYC submitted successfully!' });
            }

            console.log('KYC Response:', response);

            // Reset form and files
            setFormData({ emirates_id: '', passport_no: '', source_of_funds: '' });
            setFiles({ emirates_id_front_img: null, emirates_id_back_img: null, visa_copy: null });
            setPreviews({ emirates_id_front_img: null, emirates_id_back_img: null, visa_copy: null });
            Object.values(fileInputRefs).forEach(ref => {
                if (ref.current) ref.current.value = '';
            });
            
            setIsEditing(false);
            await fetchExistingKyc();
            
        } catch (error) {
            console.error('KYC submission error:', error);
            let errorMessage = 'An error occurred while submitting KYC';
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.';
                } else if (error.response.status === 404) {
                    const htmlError = extractErrorFromHtml(error.response.data);
                    if (htmlError && htmlError.toLowerCase().includes('address details not found')) {
                        errorMessage = 'Address details not found. Please update your address in your profile before submitting KYC.';
                    } else {
                        errorMessage = htmlError || 'Address details not found. Please update your address in your profile before submitting KYC.';
                    }
                } else if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        const htmlError = extractErrorFromHtml(error.response.data);
                        errorMessage = htmlError || errorMessage;
                    } else if (error.response.data.message) {
                        if (error.response.data.message.includes('Authentication failed')) {
                            errorMessage = 'Authentication failed. Please log in again.';
                        } else {
                            errorMessage = error.response.data.message;
                        }
                    }
                }
            } else if (error.message) {
                if (error.message.includes('Address details not found')) {
                    errorMessage = 'Address details not found. Please update your address in your profile before submitting KYC.';
                } else {
                    errorMessage = error.message;
                }
            }
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5" />;
            case 'rejected':
                return <XCircle className="w-5 h-5" />;
            case 'pending':
                return <Clock className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setMessage({ type: '', text: '' });
        // Preload existing images into previews
        if (existingKyc) {
            setPreviews({
                emirates_id_front_img: existingKyc.emirates_id_front_img
                    ? getAuthenticatedImageUrl(existingKyc.emirates_id_front_img)
                    : null,
                emirates_id_back_img: existingKyc.emirates_id_back_img
                    ? getAuthenticatedImageUrl(existingKyc.emirates_id_back_img)
                    : null,
                visa_copy: existingKyc.visa_copy
                    ? getAuthenticatedImageUrl(existingKyc.visa_copy)
                    : null,
            });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form to existing data
        if (existingKyc) {
            setFormData({
                emirates_id: existingKyc.emirates_id || '',
                passport_no: existingKyc.passport_no || '',
                source_of_funds: existingKyc.source_of_funds || '',
            });
            // Reset previews to existing images
            setPreviews({
                emirates_id_front_img: existingKyc.emirates_id_front_img
                    ? getAuthenticatedImageUrl(existingKyc.emirates_id_front_img)
                    : null,
                emirates_id_back_img: existingKyc.emirates_id_back_img
                    ? getAuthenticatedImageUrl(existingKyc.emirates_id_back_img)
                    : null,
                visa_copy: existingKyc.visa_copy
                    ? getAuthenticatedImageUrl(existingKyc.visa_copy)
                    : null,
            });
        }
        setFiles({ emirates_id_front_img: null, emirates_id_back_img: null, visa_copy: null });
        setMessage({ type: '', text: '' });
    };

    const FileUploadBox = ({ fieldName, label, required = false, accept = 'image/png, image/jpeg' }) => {
        const file = files[fieldName];
        const preview = previews[fieldName];
        const isLoading = fileLoading[fieldName];

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500 ml-1">*</span>}
                </label>

                <div className="relative">
                    <input
                        id={fieldName}
                        type="file"
                        accept={accept}
                        ref={fileInputRefs[fieldName]}
                        onChange={(e) => handleFileChange(e, fieldName)}
                        className="hidden"
                        disabled={isLoading}
                    />

                    {!preview ? (
                        <label
                            htmlFor={fieldName}
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg transition-colors ${isLoading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                )}
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">{isLoading ? 'Uploading...' : 'Click to upload'}</span>
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                            </div>
                        </label>
                    ) : (
                        <div className="relative">
                            <img
                                src={preview}
                                alt={label}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(fieldName)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                                ×
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                {file ? file.name : 'Existing Image'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getAuthenticatedImageUrl = (fileName) => {
        const baseUrl = 'http://localhost:8000';
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return `${baseUrl}/${fileName}${token ? `?token=${token}` : ''}`;
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return !!token;
    };

    const openDocumentModal = (fileName, label) => {
        setSelectedDocument({ 
            fileName, 
            label, 
            url: getAuthenticatedImageUrl(fileName) 
        });
        setShowDocumentModal(true);
    };

    const closeDocumentModal = () => {
        setSelectedDocument(null);
        setShowDocumentModal(false);
    };

    const DocumentPreview = ({ fileName, label }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);
        const documentUrl = getAuthenticatedImageUrl(fileName);

        useEffect(() => {
            if (fileName) {
                const img = new Image();
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (token) {
                    fetch(documentUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.blob();
                        }
                        throw new Error('Failed to load image');
                    })
                    .then(blob => {
                        const objectUrl = URL.createObjectURL(blob);
                        img.src = objectUrl;
                        setImageLoading(false);
                    })
                    .catch(error => {
                        console.error('Error loading image:', error);
                        setImageError(true);
                        setImageLoading(false);
                    });
                } else {
                    setImageError(true);
                    setImageLoading(false);
                }
            }
        }, [fileName]);

        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                        </div>
                        <button
                            onClick={() => openDocumentModal(fileName, label)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                        </button>
                    </div>
                </div>
                <div className="p-2">
                    {imageLoading ? (
                        <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-xs text-gray-500">Loading image...</p>
                            </div>
                        </div>
                    ) : !imageError ? (
                        <AuthenticatedImage
                            fileName={fileName}
                            alt={label}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openDocumentModal(fileName, label)}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div 
                            className="w-full h-24 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => openDocumentModal(fileName, label)}
                        >
                            <div className="text-center">
                                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Click to view</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const AuthenticatedImage = ({ fileName, alt, className, onClick, onError }) => {
        const [imageSrc, setImageSrc] = useState('');
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const loadImage = async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    const baseUrl = 'http://localhost:8000';
                    const url = `${baseUrl}/${fileName}${token ? `?token=${token}` : ''}`;

                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        const objectUrl = URL.createObjectURL(blob);
                        setImageSrc(objectUrl);
                    } else {
                        throw new Error('Failed to load image');
                    }
                } catch (error) {
                    console.error('Error loading image:', error);
                    if (onError) onError();
                } finally {
                    setLoading(false);
                }
            };

            if (fileName) {
                loadImage();
            }

            return () => {
                if (imageSrc && imageSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }, [fileName]);

        if (loading) {
            return (
                <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        if (!imageSrc) {
            return (
                <div 
                    className="w-full h-24 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={onClick}
                >
                    <div className="text-center">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Image unavailable</p>
                    </div>
                </div>
            );
        }

        return (
            <img
                src={imageSrc}
                alt={alt}
                className={className}
                onClick={onClick}
            />
        );
    };

    const DocumentModal = () => {
        if (!showDocumentModal || !selectedDocument) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold">{selectedDocument.label}</h3>
                        <button
                            onClick={closeDocumentModal}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 max-h-[70vh] overflow-auto">
                        <AuthenticatedImage
                            fileName={selectedDocument.fileName}
                            alt={selectedDocument.label}
                            className="w-full h-auto max-w-full object-contain"
                            onError={() => {
                                console.log('Failed to load image in modal');
                            }}
                        />
                        <div className="hidden text-center py-8" id="modal-error-fallback">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Unable to preview document</p>
                            <a
                                href={selectedDocument.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 underline mt-2 inline-block"
                            >
                                Try opening in new tab
                            </a>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
                        <a
                            href={selectedDocument.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Open in New Tab
                        </a>
                        <button
                            onClick={closeDocumentModal}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (fetchingKyc) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading KYC information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated() && !message.text.includes('log in')) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please log in to access KYC verification.</p>
                    <button 
                        onClick={() => window.location.href = '/login'} 
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (existingKyc && !isEditing) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">KYC Verification</h1>
                    {existingKyc.status === 'rejected' && (
                        <button
                            onClick={handleEditClick}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Update KYC</span>
                        </button>
                    )}
                </div>

                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'}`}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className={`px-3 py-1 rounded-full border flex items-center space-x-2 ${getStatusColor(existingKyc.status)}`}>
                            {getStatusIcon(existingKyc.status)}
                            <span className="capitalize font-medium">{existingKyc.status}</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                            Submitted on {new Date(existingKyc.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {existingKyc.status === 'rejected' && rejectionReason && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="font-medium text-red-800 mb-2">Rejection Reason:</h3>
                            <p className="text-red-700">{rejectionReason}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Emirates ID Number</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    {existingKyc.emirates_id}
                                </div>
                            </div>

                            {existingKyc.passport_no && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        {existingKyc.passport_no}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    {existingKyc.source_of_funds}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Documents</label>
                                <div className="space-y-4">
                                    {existingKyc.emirates_id_front_img && (
                                        <DocumentPreview
                                            fileName={existingKyc.emirates_id_front_img}
                                            label="Emirates ID (Front)" />
                                    )}
                                    {existingKyc.emirates_id_back_img && (
                                        <DocumentPreview
                                            fileName={existingKyc.emirates_id_back_img}
                                            label="Emirates ID (Back)" />
                                    )}
                                    {existingKyc.visa_copy && (
                                        <DocumentPreview
                                            fileName={existingKyc.visa_copy}
                                            label="Visa Copy" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Status Information:</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        {existingKyc.status === 'pending' && (
                            <li>Your KYC application is currently under review</li>
                        )}
                        {existingKyc.status === 'approved' && (
                            <li>Your KYC has been approved and your account is fully verified</li>
                        )}
                        {existingKyc.status === 'rejected' && (
                            <>
                                <li>Your KYC application was rejected. Please review the rejection reason above</li>
                                <li>You can update your KYC information and resubmit using the "Update KYC" button</li>
                            </>
                        )}
                    </ul>
                </div>
                <DocumentModal />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">
                    {existingKyc?.status === 'rejected' ? 'Update KYC Verification' : 'KYC Verification'}
                </h1>
                {isEditing && (
                    <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {existingKyc?.status === 'rejected' && rejectionReason && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">Previous Rejection Reason:</h3>
                    <p className="text-red-700">{rejectionReason}</p>
                </div>
            )}

            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="emirates_id" className="block font-medium mb-2">
                                Emirates ID Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="emirates_id"
                                    name="emirates_id"
                                    value={formData.emirates_id}
                                    onChange={handleInputChange}
                                    placeholder="Enter your Emirates ID number"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="passport_no" className="block font-medium mb-2">
                                Passport Number (Optional)
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="passport_no"
                                    name="passport_no"
                                    value={formData.passport_no}
                                    onChange={handleInputChange}
                                    placeholder="Enter your passport number"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="source_of_funds" className="block font-medium mb-2">
                                Source of Funds <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="source_of_funds"
                                    name="source_of_funds"
                                    value={formData.source_of_funds}
                                    onChange={handleInputChange}
                                    placeholder="Enter source of funds"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUploadBox fieldName="emirates_id_front_img" label="Emirates ID (Front)" required />
                            <FileUploadBox fieldName="emirates_id_back_img" label="Emirates ID (Back)" required />
                        </div>
                        <FileUploadBox fieldName="visa_copy" label="Visa Copy (Optional)" />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`py-3 px-6 rounded-lg font-semibold text-white transition-all ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>
                                    {existingKyc?.status === 'rejected' ? 'Updating...' : 'Submitting...'}
                                </span>
                            </div>
                        ) : (
                            existingKyc?.status === 'rejected' ? 'Update KYC Application' : 'Submit KYC Application'
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Please ensure all uploaded images are clear and readable</li>
                    <li>Maximum file size allowed is 5MB per image</li>
                    <li>Only JPEG and PNG formats are accepted</li>
                    <li>Your information will be kept secure and confidential</li>
                    <li><strong>Note:</strong> You must have your address details updated in your profile before submitting KYC</li>
                </ul>
            </div>
            <DocumentModal />
        </div>
    );
};

export default Kyc;