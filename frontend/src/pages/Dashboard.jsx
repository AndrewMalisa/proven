import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Dashboard.css'

function Dashboard() {
  const { logout, user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [profileData, setProfileData] = useState({})
  const [workExperiences, setWorkExperiences] = useState([])
  const [referees, setReferees] = useState([])
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authUser) {
      fetchDashboardData()
    }
  }, [authUser])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = authUser?.id || null
      
      // Fetch all dashboard data
      const [profileRes, workRes, refereesRes, cvsRes] = await Promise.all([
        fetch(`http://127.0.0.1:9000/api/profile.php?user_id=${token}`),
        fetch(`http://127.0.0.1:9000/api/work-experience.php?user_id=${token}`),
        fetch(`http://127.0.0.1:9000/api/referees.php?user_id=${token}`),
        fetch(`http://127.0.0.1:9000/api/cv.php?user_id=${token}`)
      ])

      if (profileRes.ok) {
        const profile = await profileRes.json()
        setProfileData(profile.data || {})
      }

      if (workRes.ok) {
        const work = await workRes.json()
        setWorkExperiences(work.data || [])
      }

      if (refereesRes.ok) {
        const ref = await refereesRes.json()
        setReferees(ref.data || [])
      }

      if (cvsRes.ok) {
        const cv = await cvsRes.json()
        setCvs(cv.data || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProfileCompletion = () => {
    let completion = 0
    const totalCategories = 4

    // Personal details (25%)
    if (profileData.name || profileData.email || profileData.phone) completion += 25

    // Work experience (25%)
    if (workExperiences.length > 0) completion += 25

    // Referees (25%)
    if (referees.length > 0) completion += 25

    // CV (25%)
    if (cvs.length > 0) completion += 25

    return completion
  }

  
  const renderSidebar = () => (
    <div className='sidebar'>
      <div className='logo'>
        <h2>Proven</h2>
      </div>
      <nav className='sidebar-nav'>
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Details
        </button>
        <button
          className={`nav-item ${activeTab === 'work' ? 'active' : ''}`}
          onClick={() => setActiveTab('work')}
        >
          Work Experience
        </button>
        <button
          className={`nav-item ${activeTab === 'referees' ? 'active' : ''}`}
          onClick={() => setActiveTab('referees')}
        >
          Referees
        </button>
        <button
          className={`nav-item ${activeTab === 'cv' ? 'active' : ''}`}
          onClick={() => setActiveTab('cv')}
        >
          CV
        </button>
      </nav>
    </div>
  )

  const renderTopNavbar = () => (
    <div className='top-navbar'>
      <div className='navbar-content'>
        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        <div className='profile-dropdown'>
          <div className='profile-picture'>
            {profileData.profile_picture ? (
              <img src={`http://127.0.0.1:9000/${profileData.profile_picture}`} alt='Profile' />
            ) : (
              <div className='default-avatar'>
                {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className='dropdown-menu'>
            <button onClick={() => setActiveTab('personal')}>View Profile</button>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDashboardContent = () => {
    const completion = calculateProfileCompletion()
    
    return (
      <div className='dashboard-content'>
        <div className='stats-grid'>
          <div className='stat-card'>
            <h3>Profile Completion</h3>
            <div className='completion-circle' style={{'--completion': `${completion * 3.6}deg`}}>
              <span>{completion}%</span>
            </div>
          </div>
          <div className='stat-card'>
            <h3>Work Experience</h3>
            <p className='stat-number'>{workExperiences.length}</p>
          </div>
          <div className='stat-card'>
            <h3>Referees</h3>
            <p className='stat-number'>{referees.length}</p>
          </div>
          <div className='stat-card'>
            <h3>CV Status</h3>
            <p className='stat-status'>
              {cvs.length === 0 ? 'Missing' : cvs[0].type === 'generated' ? 'Generated' : 'Uploaded'}
            </p>
          </div>
        </div>

        <div className='quick-actions'>
          <h3>Quick Actions</h3>
          <div className='action-buttons'>
            <button onClick={() => setActiveTab('personal')}>Complete Profile</button>
            <button onClick={() => setActiveTab('work')}>Add Work Experience</button>
            <button onClick={() => setActiveTab('referees')}>Add Referee</button>
            <button onClick={() => setActiveTab('cv')}>Create CV</button>
            <button onClick={() => setActiveTab('cv')}>Upload CV</button>
          </div>
        </div>
      </div>
    )
  }

  const renderPersonalDetailsTab = () => {
    const [formData, setFormData] = useState({
      name: profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      location: profileData.location || '',
      date_of_birth: profileData.date_of_birth || '',
      gender: profileData.gender || '',
      bio: profileData.bio || ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setMessage('')

      try {
        const response = await fetch(`http://127.0.0.1:9000/api/profile.php?user_id=${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()
        
        if (data.success) {
          setMessage('Profile updated successfully!')
          setProfileData({ ...profileData, ...formData })
        } else {
          setMessage(data.message || 'Failed to update profile')
        }
      } catch (error) {
        setMessage('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className='personal-details'>
        <h2>Personal Details</h2>
        {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit} className='personal-form'>
          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='name'>Full Name *</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                disabled
                className='disabled'
              />
              <small>Email cannot be changed</small>
            </div>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='phone'>Phone</label>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='location'>Location</label>
              <input
                type='text'
                id='location'
                name='location'
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='date_of_birth'>Date of Birth</label>
              <input
                type='date'
                id='date_of_birth'
                name='date_of_birth'
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='gender'>Gender</label>
              <select
                id='gender'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
              >
                <option value=''>Select Gender</option>
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='other'>Other</option>
              </select>
            </div>
          </div>

          <div className='form-group full-width'>
            <label htmlFor='bio'>Bio</label>
            <textarea
              id='bio'
              name='bio'
              value={formData.bio}
              onChange={handleChange}
              rows='4'
              placeholder='Tell us about yourself...'
            />
          </div>

          <div className='form-actions'>
            <button type='submit' disabled={loading} className='btn-primary'>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  const renderWorkExperienceTab = () => {
    const [showForm, setShowForm] = useState(false)
    const [editingExperience, setEditingExperience] = useState(null)
    const [formData, setFormData] = useState({
      job_title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      responsibilities: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const resetForm = () => {
      setFormData({
        job_title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        responsibilities: ''
      })
      setEditingExperience(null)
      setShowForm(false)
    }

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setMessage('')

      try {
        const url = editingExperience 
          ? `http://127.0.0.1:9000/api/work-experience.php?user_id=${user.id}&id=${editingExperience.id}`
          : `http://127.0.0.1:9000/api/work-experience.php?user_id=${user.id}`

        const method = editingExperience ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()
        
        if (data.success) {
          setMessage(editingExperience ? 'Work experience updated successfully!' : 'Work experience added successfully!')
          resetForm()
          fetchDashboardData()
        } else {
          setMessage(data.message || 'Failed to save work experience')
        }
      } catch (error) {
        setMessage('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const handleEdit = (experience) => {
      setEditingExperience(experience)
      setFormData({
        job_title: experience.job_title,
        company: experience.company,
        location: experience.location || '',
        start_date: experience.start_date,
        end_date: experience.end_date || '',
        responsibilities: experience.responsibilities || ''
      })
      setShowForm(true)
    }

    const handleDelete = async (id) => {
      if (!confirm('Are you sure you want to delete this work experience?')) {
        return
      }

      try {
        const response = await fetch(`http://127.0.0.1:9000/api/work-experience.php?user_id=${user.id}&id=${id}`, {
          method: 'DELETE',
        })

        const data = await response.json()
        
        if (data.success) {
          setMessage('Work experience deleted successfully!')
          fetchDashboardData()
        } else {
          setMessage(data.message || 'Failed to delete work experience')
        }
      } catch (error) {
        setMessage('Something went wrong. Please try again.')
      }
    }

    return (
      <div className='work-experience'>
        <div className='section-header'>
          <h2>Work Experience</h2>
          <button 
            className='btn-primary' 
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            Add Experience
          </button>
        </div>

        {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

        {showForm && (
          <div className='experience-form'>
            <h3>{editingExperience ? 'Edit Experience' : 'Add New Experience'}</h3>
            <form onSubmit={handleSubmit}>
              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='job_title'>Job Title *</label>
                  <input
                    type='text'
                    id='job_title'
                    name='job_title'
                    value={formData.job_title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className='form-group'>
                  <label htmlFor='company'>Company *</label>
                  <input
                    type='text'
                    id='company'
                    name='company'
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='location'>Location</label>
                  <input
                    type='text'
                    id='location'
                    name='location'
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                
                <div className='form-group'>
                  <label htmlFor='start_date'>Start Date *</label>
                  <input
                    type='date'
                    id='start_date'
                    name='start_date'
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='end_date'>End Date</label>
                  <input
                    type='date'
                    id='end_date'
                    name='end_date'
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date}
                  />
                  <small>Leave empty if currently working here</small>
                </div>
              </div>

              <div className='form-group full-width'>
                <label htmlFor='responsibilities'>Responsibilities</label>
                <textarea
                  id='responsibilities'
                  name='responsibilities'
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows='4'
                  placeholder='Describe your key responsibilities and achievements...'
                />
              </div>

              <div className='form-actions'>
                <button type='button' onClick={resetForm} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' disabled={loading} className='btn-primary'>
                  {loading ? 'Saving...' : (editingExperience ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className='experiences-list'>
          {workExperiences.length === 0 ? (
            <div className='empty-state'>
              <p>No work experiences added yet.</p>
              <button onClick={() => setShowForm(true)} className='btn-primary'>
                Add Your First Experience
              </button>
            </div>
          ) : (
            workExperiences.map((experience) => (
              <div key={experience.id} className='experience-card'>
                <div className='experience-header'>
                  <h3>{experience.job_title}</h3>
                  <div className='experience-actions'>
                    <button onClick={() => handleEdit(experience)} className='btn-edit'>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(experience.id)} className='btn-delete'>
                      Delete
                    </button>
                  </div>
                </div>
                <p className='company'>{experience.company}</p>
                {experience.location && <p className='location'>{experience.location}</p>}
                <p className='duration'>
                  {new Date(experience.start_date).toLocaleDateString()} - 
                  {experience.end_date ? new Date(experience.end_date).toLocaleDateString() : 'Present'}
                </p>
                {experience.responsibilities && (
                  <div className='responsibilities'>
                    <h4>Responsibilities:</h4>
                    <p>{experience.responsibilities}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    if (loading) {
      return <div className='loading'>Loading...</div>
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent()
      case 'personal':
        return renderPersonalDetailsTab()
      case 'work':
        return renderWorkExperienceTab()
      case 'referees':
        return <div className='placeholder'>Referees Tab - Coming Soon</div>
      case 'cv':
        return <div className='placeholder'>CV Tab - Coming Soon</div>
      default:
        return renderDashboardContent()
    }
  }

  if (!authUser) {
    return <div className='loading'>Redirecting...</div>
  }

  return (
    <div className='dashboard-container'>
      {renderSidebar()}
      <div className='main-content'>
        {renderTopNavbar()}
        <div className='content-area'>
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
