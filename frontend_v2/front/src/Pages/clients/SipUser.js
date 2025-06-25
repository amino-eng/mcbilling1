"use client"

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Tabs, Tab, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { CSVLink } from "react-csv";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaPhoneAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaUserAlt,
  FaEllipsisV,
  FaExclamationCircle,
  FaQuestionCircle,
  FaFilter
} from "react-icons/fa";

const SIPUsers = () => {
  const [sipUsers, setSipUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [callerIds, setCallerIds] = useState([]);
  const [isLoadingCallerIds, setIsLoadingCallerIds] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [prefixes, setPrefixes] = useState([]);
  const [isLoadingPrefixes, setIsLoadingPrefixes] = useState(false);

  // Toast notifications state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Show toast notification
  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const initialFormState = {
    id_user: "",
    name: "",
    accountcode: "",
    host: "dynamic",
    status: "1",
    callerid: "",
    alias: "",
    disallow: "all",
    codecs: ['g729', 'ulaw', 'opus', 'gsm', 'alaw'],
    sip_group: "",
    block_call_reg: "no",
    record_call: "no",
    techprefix: "",
    nat: "",
    directmedia: "no",
    qualify: "no",
    context: "",
    dtmfmode: "RFC2833",
    insecure: "no",
    deny: "",
    permit: "",
    type: "friend",
    allowtransfer: "no",
    fakeRing: "no",
    callLimit: 0,
    moh: "",
    addparameter: "",
    forwardType: "undefined",
    dial_timeout: 60,
    enableVoicemail: "no",
    email: "",
    voicemail_email: "",
    voicemail_password: "",
    sippasswd: "",
    allow: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/admin/users/Users")
      .then((res) => {
        const users = res.data?.users || [];
        setUsers(users);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setUsers([]);
      });
  };

  const fetchSIPUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/SIPUsers/affiche");
      setSipUsers(response.data?.sipUsers || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSipUsers([]);
    }
  };

  // Add delete function with toast notifications
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this SIP user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/SIPUsers/delete/${id}`);
        fetchSIPUsers();
        showToastMessage("SIP user deleted successfully!");
      } catch (error) {
        console.error("Error deleting SIP user:", error);
        const errorMessage = error.response?.data?.error || error.message;
        showToastMessage(`Error: ${errorMessage}`, "danger");
      }
    }
  };

  const handleEdit = async (user) => {
    setEditingId(user.id);
    setIsLoading(true);
    try {
      // Fetch complete SIP user data from the backend
      const response = await axios.get(`http://localhost:5000/api/admin/SIPUsers/${user.id}/details`);
      const sipUser = response.data.sipUser;
      console.log('Received SIP user data from backend:', JSON.stringify(sipUser, null, 2));
      
      // Create a new form data object with all default values
      const newFormData = {
        id_user: "",
        name: "",
        accountcode: "",
        host: "dynamic",
        status: "1",
        callerid: "",
        alias: "",
        disallow: "all",
        codecs: ['g729', 'ulaw', 'opus', 'gsm', 'alaw'],
        sip_group: "",
        block_call_reg: "no",
        record_call: "no",
        techprefix: "",
        nat: "",
        directmedia: "no",
        qualify: "no",
        context: "",
        dtmfmode: "RFC2833",
        insecure: "no",
        deny: "",
        permit: "",
        type: "friend",
        allowtransfer: "no",
        fakeRing: "no",
        callLimit: 0,
        moh: "",
        addparameter: "",
        forwardType: "undefined",
        dial_timeout: 60,
        enableVoicemail: "no",
        email: "",
        voicemail_email: "",
        voicemail_password: "",
        sippasswd: ""
      };

      // Update with values from the API response
      const formData = {
        ...newFormData,
        ...sipUser,  // This will override any matching fields from newFormData
        // Handle special cases
        status: sipUser.status?.toString() || "1",
        codecs: sipUser.allow ? sipUser.allow.split(',').filter(Boolean) : [...newFormData.codecs],
        block_call_reg: sipUser.block_call_reg === 1 ? "yes" : "no",
        record_call: sipUser.record_call === 1 ? "yes" : "no",
        directmedia: sipUser.directmedia === 1 ? "yes" : "no",
        qualify: sipUser.qualify === 1 ? "yes" : "no",
        allowtransfer: sipUser.allowtransfer === 1 ? "yes" : "no",
        callLimit: sipUser.call_limit || sipUser.callLimit || 0,
        sippasswd: sipUser.secret || sipUser.sippasswd || "",
        // Ensure callerid and techprefix are properly set
        callerid: sipUser.callerid || "",
        techprefix: sipUser.techprefix || ""
      };
      
      console.log('Setting form data with:', {
        callerid: formData.callerid,
        techprefix: formData.techprefix,
        calleridType: typeof formData.callerid,
        techprefixType: typeof formData.techprefix
      });
      
      console.log("Setting form data for edit:", formData);
      console.log("SIP Password in form data:", formData.sippasswd);
      setFormData(formData);
      setShowEdit(true);
    } catch (error) {
      console.error("Error preparing edit form:", error);
      showToastMessage(
        `Error loading SIP user data: ${error.response?.data?.error || error.message}`,
        "danger"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate a secure password
  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedUser("");
  };

  const fetchUserPassword = async (userId, setPasswordDirectly = false) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users/user/${userId}/password`);
      if (response.data && response.data.password) {
        if (setPasswordDirectly) {
          setFormData(prev => ({
            ...prev,
            sippasswd: response.data.password
          }));
        }
        return response.data.password;
      }
      return '';
    } catch (error) {
      console.error("Error fetching user password:", error);
      if (setPasswordDirectly) {
        showToastMessage("Error retrieving user password", "danger");
      }
      return '';
    }
  };

  const handleUserChange = async (e) => {
    const selectedUserId = e.target.value;
    const selectedUser = users.find(user => user.id == selectedUserId);
    
    // Mettre à jour l'utilisateur sélectionné
    setSelectedUser(selectedUserId);
    
    // Réinitialiser les Caller IDs lors du changement d'utilisateur
    setCallerIds([]);
    
    if (selectedUserId && selectedUser) {
      try {
        setIsLoadingCallerIds(true);
        
        // Récupérer les Caller IDs et le mot de passe en parallèle
        const [callerIdsResponse, password] = await Promise.all([
          axios.get(`http://localhost:5000/api/admin/CallerId/user/${selectedUserId}`),
          fetchUserPassword(selectedUserId)
        ]);
        
        const userCallerIds = callerIdsResponse.data.callerIds || [];
        setCallerIds(userCallerIds);
        
        // Utiliser le premier Caller ID disponible ou le nom d'utilisateur par défaut
        const defaultCallerId = userCallerIds.length > 0 
          ? userCallerIds[0].callerid 
          : `"${selectedUser.username}" <${selectedUser.username}>`;
        
        // Mettre à jour les champs du formulaire
        setFormData({
          ...formData,
          id_user: selectedUserId,
          name: selectedUser.username || "",
          accountcode: selectedUser.username || "",
          callerid: defaultCallerId, // Définir automatiquement le Caller ID
          sippasswd: password || "" // Définir le mot de passe
        });
        
      } catch (error) {
        console.error("Error retrieving data:", error);
        showToastMessage("Error retrieving user data", "danger");
      } finally {
        setIsLoadingCallerIds(false);
      }
    } else {
      // Reset the form if no user is selected
      setFormData({
        ...formData,
        id_user: "",
        name: "",
        accountcode: "",
        callerid: "",
        sippasswd: ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => {
        const codecs = checked ? [...prev.codecs, value] : prev.codecs.filter((codec) => codec !== value);
        return { ...prev, codecs };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First, get the user's password
      const userResponse = await axios.get(`http://localhost:5000/api/admin/users/user/${selectedUser}/password`);
      const userPassword = userResponse.data?.password;
      
      if (!userPassword) {
        throw new Error("Impossible de récupérer le mot de passe de l'utilisateur");
      }
      
      const dataToSubmit = {
        id_user: selectedUser,
        name: formData.name,
        accountcode: formData.accountcode || "",
        host: formData.host,
        status: formData.status || "1",
        callerid: formData.callerid || "",
        alias: formData.alias || "",
        disable: formData.disable || "no",
        codecs: Array.isArray(formData.codecs) ? formData.codecs.join(",") : formData.codecs,
        sip_group: formData.sip_group || "",
        block_call_reg: formData.block_call_reg || "no",
        record_call: formData.record_call || "no",
        techprefix: formData.techprefix || "",
        nat: formData.nat || "",
        directmedia: formData.directmedia || "no",
        qualify: formData.qualify || "no",
        context: formData.context || "",
        dtmfmode: formData.dtmfmode || "RFC2833",
        insecure: formData.insecure || "no",
        deny: formData.deny || "",
        permit: formData.permit || "",
        type: formData.type || "friend",
        allowtransfer: formData.allowtransfer || "no",
        fakeRing: formData.fakeRing || "no",
        callLimit: formData.callLimit || 0,
        moh: formData.moh || "",
        addparameter: formData.addparameter || "",
        forwardType: formData.forwardType || "undefined",
        dial_timeout: formData.dial_timeout || 60,
        enableVoicemail: formData.enableVoicemail || "no",
        email: formData.email || "",
        voicemail_email: formData.voicemail_email || "",
        voicemail_password: formData.voicemail_password || "",
        secret: userPassword // Set the secret to the user's password
      };
      
      console.log("Submitting SIP user data:", dataToSubmit);
      
      // Submit the data
      const response = await axios.post(
        "http://localhost:5000/api/admin/SIPUsers/ajouter", 
        dataToSubmit,
        { 
          validateStatus: (status) => status < 500, // Don't throw for 4xx errors
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Check for error status codes
      if (response.status >= 200 && response.status < 300) {
        // Success case
        setShowAdd(false);
        resetForm();
        fetchSIPUsers();
        showToastMessage("SIP user added successfully!");
      } else {
        // Handle error responses
        const errorMessage = response.data?.details || 
                             response.data?.error || 
                             'Failed to add SIP user';
        showToastMessage(`Error: ${errorMessage}`, 'danger');
      }
    } catch (error) {
      console.error("Error adding SIP user:", error.response ? error.response.data : error);
      
      let errorMessage = error.message;
      
      // Handle duplicate SIP user error (status 409)
      if (error.response?.status === 409) {
        errorMessage = error.response.data.details || "A SIP user with this name already exists. Please choose a different name.";
      } 
      // Handle other error responses
      else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.details) {
          errorMessage += `: ${error.response.data.details}`;
        }
      }
      
      showToastMessage(`Error: ${errorMessage}`, "danger");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First, get the user's password
      const userResponse = await axios.get(`http://localhost:5000/api/admin/users/user/${formData.id_user}/password`);
      const userPassword = userResponse.data?.password;
      
      if (!userPassword) {
        throw new Error("Impossible de récupérer le mot de passe de l'utilisateur");
      }
      
      // Prepare data for backend
      const dataToUpdate = {
        ...formData,
        // Use the user's password as the SIP secret
        secret: userPassword,
        // Map frontend field names to backend field names
        sippasswd: userPassword, // Also set sippasswd to the same value for backward compatibility
        // Ensure codecs are sent as comma-separated string
        allow: formData.codecs?.join(','),
        // Convert string 'yes'/'no' to 1/0 for boolean fields
        block_call_reg: formData.block_call_reg === 'yes' ? 1 : 0,
        record_call: formData.record_call === 'yes' ? 1 : 0,
        directmedia: formData.directmedia === 'yes' ? 1 : 0,
        qualify: formData.qualify === 'yes' ? 1 : 0,
        allowtransfer: formData.allowtransfer === 'yes' ? 1 : 0,
        // Ensure numeric fields are properly typed
        status: formData.status ? parseInt(formData.status, 10) : 1,
        callLimit: formData.callLimit ? parseInt(formData.callLimit, 10) : 0,
        dial_timeout: formData.dial_timeout ? parseInt(formData.dial_timeout, 10) : 60,
        // Explicitly include and ensure string type for callerid and techprefix
        callerid: formData.callerid !== null && formData.callerid !== undefined ? String(formData.callerid) : "",
        techprefix: formData.techprefix !== null && formData.techprefix !== undefined ? String(formData.techprefix) : ""
      };
      
      console.log('Update data with processed fields:', {
        callerid: dataToUpdate.callerid,
        techprefix: dataToUpdate.techprefix,
        calleridType: typeof dataToUpdate.callerid,
        techprefixType: typeof dataToUpdate.techprefix
      });

      console.log("Sending update request with data:", dataToUpdate);
      
      const response = await axios.put(
        `http://localhost:5000/api/admin/SIPUsers/modifier/${editingId}`, 
        dataToUpdate,
        { 
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true // This will prevent axios from throwing errors on HTTP error status
        }
      );
      
      console.log("Update response status:", response.status);
      console.log("Update response data:", response.data);
      
      if (response.status >= 200 && response.status < 300) {
        setShowEdit(false);
        resetForm();
        fetchSIPUsers();
        showToastMessage("SIP user updated successfully!");
      } else if (response.status === 409) {
        // Handle duplicate SIP user error
        const errorMessage = response.data?.details || 
                             response.data?.error || 
                             'A SIP user with this name already exists. Please choose a different name.';
        showToastMessage(`Error: ${errorMessage}`, "danger");
      } else {
        console.error("Update failed with status", response.status, ":", response.data);
        let errorMessage = 'Failed to update SIP user';
        
        // Try to extract more specific error message
        if (response.data?.error) {
          errorMessage = response.data.error;
          if (response.data.details) {
            errorMessage += `: ${response.data.details}`;
          }
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        }
        
        showToastMessage(
          `Error: ${errorMessage}`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in handleUpdate:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      let errorMessage = error.message;
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showToastMessage(
        `Error: ${errorMessage}`,
        "danger"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ["ID", "Name", "Account Code", "Host", "Status"];
    csvRows.push(headers.join(","));
    sipUsers.forEach((user) => {
      const row = [
        user.id_user,
        user.name,
        user.accountcode,
        user.host,
        user.status === 1 ? "unregistered" : user.status === 0 ? "unmonitored" : "unknown",
      ];
      csvRows.push(row.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "sip_users.csv");
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchUsers();
    fetchSIPUsers();
    
    // Fetch prefixes
    const fetchPrefixes = async () => {
      setIsLoadingPrefixes(true);
      try {
        const response = await axios.get('http://localhost:5000/api/admin/SIPUsers/prefixes');
        setPrefixes(response.data.prefixes || []);
      } catch (error) {
        console.error('Error fetching prefixes:', error);
        showToastMessage('Error loading prefixes', 'danger');
      } finally {
        setIsLoadingPrefixes(false);
      }
    };
    
    fetchPrefixes();
  }, []);

  const filteredUsers = sipUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderForm = (isEdit = false) => {
    return (
      <>
        <Form onSubmit={isEdit ? handleUpdate : handleSubmit}>
          <Tabs defaultActiveKey="general" className="mb-3">
            <Tab eventKey="general" title="General">
              <Form.Group>
                <Form.Label>Username</Form.Label>
                <select
                  className="form-select"
                  value={isEdit ? formData.id_user : selectedUser}
                  onChange={(e) =>
                    isEdit ? setFormData({ ...formData, id_user: e.target.value }) : handleUserChange(e)
                  }
                >
                  <option value="">Select a user</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.id})
                    </option>
                  ))}
                </select>
              </Form.Group>
              <Form.Group>
                <Form.Label>SIP user</Form.Label>
                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
              </Form.Group>
              <Form.Group controlId="formPassword">
                <Form.Label>SIP Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="sippasswd"
                    value={formData.sippasswd}
                    onChange={handleChange}
                    required
                  />
                  <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </Button>
                </div>
              </Form.Group>
              {/* CallerID dropdown removed - using direct input field instead */}
              <Form.Group>
                <Form.Label>Alias</Form.Label>
                <Form.Control 
                  type="text" 
                  name="alias" 
                  value={formData.alias || ''} 
                  onChange={handleChange} 
                  placeholder="Optionnel"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Caller ID</Form.Label>
                <div className="input-group">
                  <Form.Control 
                    type="text" 
                    name="callerid" 
                    value={formData.callerid || ''} 
                    onChange={handleChange}
                    placeholder="Caller ID will be set automatically when user is selected"
                    readOnly={!!selectedUser}
                  />
                  {selectedUser && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setFormData({...formData, callerid: ''})}
                      title="Clear and edit manually"
                    >
                      <FaEdit />
                    </Button>
                  )}
                </div>
                <Form.Text className="text-muted">
                  {selectedUser ? `Caller ID for ${users.find(u => u.id === selectedUser)?.username}` : 'Select a user to set Caller ID'}
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Disallow</Form.Label>
                <Form.Control as="select" name="disable" value={formData.disable} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="all">All</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Codecs</Form.Label>
                <div className="row">
                  {[
                    "g729",
                    "g726",
                    "ulaw",
                    "speex",
                    "h264",
                    "g723",
                    "opus",
                    "g722",
                    "h263p",
                    "vp8",
                    "gsm",
                    "alaw",
                    "ilbc",
                    "h263",
                  ].map((codec) => (
                    <div className="col-4" key={codec}>
                      <Form.Check
                        type="checkbox"
                        label={codec}
                        name="codecs"
                        value={codec}
                        onChange={handleChange}
                        checked={formData.codecs?.includes(codec)}
                      />
                    </div>
                  ))}
                </div>
              </Form.Group>
              <Form.Group>
                <Form.Label>Host</Form.Label>
                <Form.Control type="text" name="host" value={formData.host} onChange={handleChange} required />
              </Form.Group>
              <Form.Group>
                <Form.Label>Group</Form.Label>
                <Form.Control
                  type="text"
                  name="sip_group"
                  value={formData.sip_group}
                  onChange={handleChange}
                  placeholder="Optionnel"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Video Support</Form.Label>
                <Form.Control as="select" name="block_call_reg" value={formData.block_call_reg} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Block Call RegEx</Form.Label>
                <Form.Control as="select" name="block_call_reg" value={formData.block_call_reg} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Record Call</Form.Label>
                <Form.Control as="select" name="record_call" value={formData.record_call} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Tech Prefix</Form.Label>
                <Form.Control
                  type="text"
                  name="techprefix"
                  value={formData.techprefix || ''}
                  onChange={handleChange}
                  placeholder="Enter tech prefix (optional)"
                />
                <Form.Text className="text-muted">
                  Enter the tech prefix if required
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  type="text" 
                  name="Description" 
                  value={formData.Description} 
                  onChange={handleChange}
                  placeholder="Optionnel"
                />
              </Form.Group>
              <Form.Group></Form.Group>

            </Tab>
            <Tab eventKey="nat" title="NAT">
              <Form.Group>
                <Form.Label>NAT</Form.Label>
                <Form.Control
                  type="text"
                  name="nat"
                  value={formData.nat}
                  onChange={handleChange}
                  placeholder="force_rport,comedia"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Direct Media</Form.Label>
                <Form.Control as="select" name="directmedia" value={formData.directmedia} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Qualify</Form.Label>
                <Form.Control as="select" name="qualify" value={formData.qualify} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
            </Tab>
            <Tab eventKey="additional" title="Additional">
              <Form.Group>
                <Form.Label>Context</Form.Label>
                <Form.Control type="text" name="context" value={formData.context} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Dtmfmode</Form.Label>
                <Form.Control as="select" name="dtmfmode" value={formData.dtmfmode} onChange={handleChange}>
                  <option value="RFC2833">RFC2833</option>
                  <option value="info">INFO</option>
                  <option value="auto">AUTO</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Insecure</Form.Label>
                <Form.Control as="select" name="insecure" value={formData.insecure} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="invite">Invite</option>
                  <option value="port">Port</option>
                  <option value="both">Both</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Deny</Form.Label>
                <Form.Control type="text" name="deny" value={formData.deny} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Permit</Form.Label>
                <Form.Control type="text" name="permit" value={formData.permit} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Control as="select" name="type" value={formData.type} onChange={handleChange}>
                  <option value="friend">Friend</option>
                  <option value="peer">Peer</option>
                                  <option value="user">User</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Transfer Allowed</Form.Label>
                <Form.Control as="select" name="allowtransfer" value={formData.allowtransfer} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Fake Ring</Form.Label>
                <Form.Control as="select" name="fakeRing" value={formData.fakeRing} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Call Limit</Form.Label>
                <Form.Control type="number" name="callLimit" value={formData.callLimit} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Music on Hold</Form.Label>
                <Form.Control type="text" name="moh" value={formData.moh} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Additional Parameter</Form.Label>
                <Form.Control type="text" name="addparameter" value={formData.addparameter} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Forward Type</Form.Label>
                <Form.Control type="text" name="forwardType" value={formData.forwardType} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Call Timeout</Form.Label>
                <Form.Control type="number" name="dial_timeout" value={formData.dial_timeout} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Voicemail Enabled</Form.Label>
                <Form.Control as="select" name="enableVoicemail" value={formData.enableVoicemail} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Voicemail Email</Form.Label>
                <Form.Control type="email" name="voicemail_email" value={formData.voicemail_email} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Voicemail Password</Form.Label>
                <Form.Control type="password" name="voicemail_password" value={formData.voicemail_password} onChange={handleChange} />
              </Form.Group>
            </Tab>
          </Tabs>
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" type="submit">
              {isEdit ? "Update" : "Add"}
            </Button>
            <Button variant="secondary" onClick={() => isEdit ? setShowEdit(false) : setShowAdd(false)} className="ms-2">
              Cancel
            </Button>
          </div>
        </Form>
      </>
    );
  };

  // Clear messages after 3 seconds
  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 3000);
  };

  // Header Component
  const SIPUserHeader = () => {
    const csvData = [
      ["Name", "Account Code", "Host", "Status"],
      ...sipUsers.map((user) => [
        user.name,
        user.accountcode,
        user.host,
        user.status === 1 ? "unregistered" : user.status === 0 ? "unmonitored" : "unknown",
      ]),
    ];

    return (
      <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
        <div className="bg-primary p-3 w-100 position-relative shiny-header">
          <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
            {Array(5)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="floating-icon position-absolute"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  <FaUserAlt
                    className="text-white opacity-25"
                    style={{
                      fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                    }}
                  />
                </div>
              ))}
          </div>
          <div className="d-flex align-items-center position-relative z-2">
            <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
              <FaUserAlt className="text-primary fs-3" />
            </div>
            <div>
              <h2 className="fw-bold mb-0 text-white">SIP Users Management</h2>
              <p className="text-white-50 mb-0 d-none d-md-block">Manage your SIP users easily</p>
            </div>
          </div>
        </div>
        <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
              <span className="me-2 fw-normal">
                Total: <span className="fw-bold">{sipUsers.length}</span>
              </span>
              <span
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "24px", height: "24px" }}
              >
                <FaUserAlt size={12} />
              </span>
            </Badge>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setShowAdd(true);
                resetForm();
              }}
              className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            >
              <div className="icon-container">
                <FaPlusCircle />
              </div>
              <span>Add SIP User</span>
            </Button>
            <CSVLink
              data={csvData}
              filename={"sip_users.csv"}
              className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
              onClick={() => setIsExporting(true)}
              onDownloaded={() => setIsExporting(false)}
            >
              <div className="icon-container">
                {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
              </div>
              <span>{isExporting ? "Exporting..." : "Export"}</span>
            </CSVLink>
          </div>
        </div>
      </Card.Header>
    );
  };

  // Search Bar Component
  const SearchBar = () => {
    return (
      <div className="position-relative mb-4">
        <Form.Control
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ps-4 shadow-sm border-0"
          style={{ height: "48px", borderRadius: "24px" }}
        />
        <FaSearch className="position-absolute text-muted" style={{ top: "16px", left: "16px" }} />
      </div>
    );
  };

  // Statut Badge Component
  const StatusBadge = ({ status }) => {
    if (status === 1) {
      return (
        <Badge bg="warning" pill className="px-3 py-2">
          <FaExclamationCircle className="me-1" /> Not registered
        </Badge>
      );
    } else if (status === 0) {
      return (
        <Badge bg="secondary" pill className="px-3 py-2">
          <FaTimesCircle className="me-1" /> Unmonitored
        </Badge>
      );
    } else {
      return (
        <Badge bg="info" pill className="px-3 py-2">
          <FaQuestionCircle className="me-1" /> Unknown
        </Badge>
      );
    }
  };

  // Action Buttons Component
  const ActionButtons = ({ onEdit, onDelete }) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button variant="outline-primary" onClick={onEdit} size="sm" className="action-btn">
          <FaEdit className="btn-icon" />
        </Button>
        <Button variant="outline-danger" onClick={onDelete} size="sm" className="action-btn">
          <FaTrashAlt className="btn-icon" />
        </Button>
        <Dropdown align="end">
          <Dropdown.Toggle as={Button} variant="light" size="sm" className="p-1 action-btn">
            <FaEllipsisV className="btn-icon" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
            <Dropdown.Item onClick={onDelete} className="text-danger">Delete</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = () => {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
            <FaUserAlt className="text-muted" style={{ fontSize: "2rem" }} />
          </div>
        </div>
        <h5>No SIP users found</h5>
        <p className="text-muted">Add a new SIP user or modify your search</p>
      </div>
    );
  };

  // Pagination Component
  const PaginationSection = () => {
    const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
    
    if (pageCount <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-4">
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={({ selected }) => paginate(selected + 1)}
          forcePage={currentPage - 1}
          containerClassName={"pagination mb-0"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
          activeClassName={"active"}
        />
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <style jsx="true">{`
        .dashboard-container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .dashboard-main {
          transition: all 0.3s ease;
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .pulse-effect {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .btn-hover-effect {
          transition: all 0.3s ease;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .btn-icon {
          transition: transform 0.2s ease;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Table styles */
        .table {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        }
        .table th, .table td, .table tr {
          border: none !important;
          position: relative;
          overflow: hidden;
        }
        
        /* Supprimer toutes les bordures Bootstrap */
        .table, .table * {
          border-collapse: collapse;
          border-spacing: 0;
          border: none !important;
          outline: none !important;
        }
        
        /* Supprimer les bordures de Bootstrap */
        .table-bordered,
        .table-bordered thead th,
        .table-bordered tbody + tbody,
        .table-bordered td,
        .table-bordered th,
        .table-bordered tr {
          border: 0 !important;
        }
        .table thead th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #212529;
          text-shadow: none;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }
        
        .table-header-bold thead th {
          padding-top: 15px;
          padding-bottom: 15px;
          position: relative;
        }
        
        .table-header-bold thead th::after {
          display: none;
        }
        .table-bordered tbody tr:hover {
          background: linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .table-bordered tbody tr:hover td {
          position: relative;
        }
        .table-bordered tbody tr:hover td::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          animation: shine 1.5s infinite;
        }
        @keyframes shine {
          100% {
            transform: translateX(100%);
          }
        }
        
        /* Shiny card effect */
        .shiny-card {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
          overflow: hidden;
        }
        
        .shiny-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg);
          animation: shineCard 6s infinite;
          pointer-events: none;
        }
        
        @keyframes shineCard {
          0% { transform: rotate(30deg) translateX(-100%); }
          20%, 100% { transform: rotate(30deg) translateX(100%); }
        }
        
        /* Button shine effects */
        .btn-hover-effect {
          position: relative;
          overflow: hidden;
        }
        
        .btn-hover-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg) translateX(-100%);
          transition: all 0.3s ease;
        }
        
        .btn-hover-effect:hover::after {
          transform: rotate(30deg) translateX(100%);
          transition: all 0.7s ease;
        }
        
        /* Shiny header effect */
        .shiny-header {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          position: relative;
          overflow: hidden;
        }
        
        .shiny-header::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-25deg);
          animation: shineHeader 5s infinite;
        }
        
        @keyframes shineHeader {
          0%, 100% { left: -100%; }
          50% { left: 100%; }
        }
        
        /* Badge shine effects */
        .badge {
          position: relative;
          overflow: hidden;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
          transition: all 0.3s ease;
        }
        
        .badge::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg) translateX(-100%);
          animation: shineBadge 3s infinite;
        }
        
        @keyframes shineBadge {
          0%, 100% { transform: rotate(30deg) translateX(-100%); }
          30%, 60% { transform: rotate(30deg) translateX(100%); }
        }
      `}</style>
      
      <div className="dashboard-main">
        {/* Toast Notifications */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1090,
          minWidth: '300px'
        }}>
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)}
            delay={5000} 
            autohide
            className={`bg-${toastVariant} text-white`}
          >
            <Toast.Header className={`bg-${toastVariant} text-white`} closeButton>
              <strong className="me-auto">
                {toastVariant === 'danger' ? 'Error' : 'Success'}
              </strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </div>
        
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow-lg border-0 overflow-hidden main-card shiny-card">
                <SIPUserHeader />
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaCheckCircle className="me-2" />
                      {successMessage}
                    </Alert>
                  )}

                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <SearchBar />
                    </Col>
                  </Row>

                  <Card className="shadow-sm border-0">
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="mb-0 table-header-bold">
                          <thead className="bg-light text-dark">
                            <tr>
                              <th className="py-3 px-4 fw-bold">Name</th>
                              <th className="py-3 px-4 fw-bold">Account Code</th>
                              <th className="py-3 px-4 fw-bold">Host</th>
                              <th className="py-3 px-4 text-center fw-bold">Status</th>
                              <th className="py-3 px-4 text-center fw-bold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoading ? (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <Spinner animation="border" variant="primary" />
                                  <p className="mt-3 text-muted">Loading data...</p>
                                </td>
                              </tr>
                            ) : currentUsers.length === 0 ? (
                              <tr>
                                <td colSpan="5">
                                  <EmptyState />
                                </td>
                              </tr>
                            ) : (
                              currentUsers.map((user) => (
                                <tr key={user.id}>
                                  <td className="py-3 px-4">{user.name}</td>
                                  <td className="py-3 px-4">
                                    <div className="d-flex flex-column">
                                      <div className="fw-medium">
                                        {user.accountcode ? (
                                          <span className="text-primary">{user.accountcode}</span>
                                        ) : (
                                          <span className="text-muted fst-italic">Not specified</span>
                                        )}
                                      </div>
                                      {user.id_user && (
                                        <div className="small text-muted">
                                          <span className="me-1">ID:</span>
                                          <span className="badge bg-light text-dark">{user.id_user}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">{user.host}</td>
                                  <td className="py-3 px-4 text-center">
                                    <StatusBadge status={user.status} />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="d-flex gap-2 justify-content-center">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleEdit(user)}
                                        className="action-btn btn-hover-effect"
                                        title="Edit"
                                      >
                                        <FaEdit className="btn-icon" />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(user.id)}
                                        className="action-btn btn-hover-effect"
                                        title="Delete"
                                      >
                                        <FaTrashAlt className="btn-icon" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!isLoading && (
                        <>
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{currentUsers.length}</span> of {filteredUsers.length} SIP Users
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtered from {sipUsers.length} total
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <PaginationSection />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Add SIP User Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered className="sip-user-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add SIP User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">{renderForm(false)}</Modal.Body>
      </Modal>
      
      {/* Edit SIP User Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered className="sip-user-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Edit SIP User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading user data...</p>
            </div>
          ) : (
            renderForm(true)
          )}
        </Modal.Body>
      </Modal>

      {/* Toast Notifications */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1060,
          minWidth: '300px'
        }}
      >
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={5000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toastVariant === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' ? 'text-white' : 'text-white'}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default SIPUsers;