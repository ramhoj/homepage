// Minimal keyboard navigation for slides
// Works with semantic IDs - no numbered slides required

// Screen Wake Lock to prevent auto-lock on mobile devices
let wakeLock = null

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen')
      console.log('Wake Lock active - screen will stay on')

      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock released')
      })
    } catch (err) {
      console.log('Wake Lock request failed:', err.message)
    }
  }
}

// Re-acquire wake lock when page becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestWakeLock()
  }
})

// Request wake lock on page load
requestWakeLock()

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    navigate(1)
  } else if (e.key === 'ArrowLeft') {
    navigate(-1)
  } else if (e.key === 'ArrowDown') {
    navigateTabs(1)
  } else if (e.key === 'ArrowUp') {
    navigateTabs(-1)
  } else if (e.key >= '1' && e.key <= '9') {
    goToSlide(parseInt(e.key, 10))
  } else if (e.key === '0') {
    goToSlide(10)
  } else if (e.key === 'n' || e.key === 'N') {
    toggleTrainingMode()
  }
})

function navigate(direction) {
  const slides = Array.from(document.querySelectorAll('.slide'))
  const currentIndex = getCurrentSlideIndex(slides)
  const nextIndex = currentIndex + direction

  if (nextIndex >= 0 && nextIndex < slides.length) {
    window.location.hash = slides[nextIndex].id
  }
}

function goToSlide(n) {
  const slides = document.querySelectorAll('.slide')
  if (n >= 1 && n <= slides.length) {
    window.location.hash = slides[n - 1].id
  }
}

function getCurrentSlideIndex(slides) {
  const hash = window.location.hash.slice(1)
  if (!hash) return 0

  const index = slides.findIndex(slide => slide.id === hash)
  return index === -1 ? 0 : index
}

// Toggle training mode (notes overlay)
function toggleTrainingMode() {
  document.body.classList.toggle('training-mode')
}

// Navigate between tabs on the current slide
function navigateTabs(direction) {
  const currentSlide = getCurrentSlide()
  if (!currentSlide) return

  const tabGroup = currentSlide.querySelector('.code-tabs')
  if (!tabGroup) return

  const tabs = Array.from(tabGroup.querySelectorAll('.code-tab'))
  if (tabs.length === 0) return

  const activeIndex = tabs.findIndex(tab => tab.classList.contains('active'))
  const nextIndex = activeIndex + direction

  if (nextIndex >= 0 && nextIndex < tabs.length) {
    tabs[nextIndex].click()
  }
}

function getCurrentSlide() {
  const hash = window.location.hash.slice(1)
  if (hash) {
    return document.getElementById(hash)
  }
  return document.querySelector('.slide:first-of-type')
}

// Set up slide counter and other initializations
document.addEventListener('DOMContentLoaded', () => {
  // Initialize code tabs
  initCodeTabs()

  // Initialize touch/swipe navigation for mobile
  initTouchNavigation()

  // Initialize notes toggle button (triggers training mode)
  const notesToggle = document.getElementById('notes-toggle')
  if (notesToggle) {
    notesToggle.addEventListener('click', toggleTrainingMode)
  }

  // Initialize slide counter, navigation, and notes toggle visibility
  updateSlideCounter()
  updateNavigation()
  updateNotesToggleVisibility()

  // Run Prism highlighting after DOM is ready
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll()
  }
})

// Touch/swipe navigation for mobile
function initTouchNavigation() {
  let touchStartX = 0
  let touchStartY = 0
  let touchEndX = 0
  let touchEndY = 0

  const minSwipeDistance = 50 // Minimum distance for a swipe
  const maxVerticalDistance = 100 // Max vertical movement to still count as horizontal swipe

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX
    touchStartY = e.changedTouches[0].screenY
  }, { passive: true })

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX
    touchEndY = e.changedTouches[0].screenY
    handleSwipe()
  }, { passive: true })

  function handleSwipe() {
    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) < minSwipeDistance) return
    if (Math.abs(deltaY) > maxVerticalDistance) return

    if (deltaX < 0) {
      // Swipe left → go to next slide
      navigate(1)
    } else {
      // Swipe right → go to previous slide
      navigate(-1)
    }
  }
}

// Update slide counter display
function updateSlideCounter() {
  const slides = document.querySelectorAll('.slide')
  const total = slides.length
  const currentIndex = getCurrentSlideIndex(Array.from(slides)) + 1
  const counter = document.getElementById('slide-counter')
  if (counter) {
    counter.textContent = `${currentIndex} / ${total}`
  }
}

// Update navigation links based on current slide
function updateNavigation() {
  const slides = Array.from(document.querySelectorAll('.slide'))
  const currentIndex = getCurrentSlideIndex(slides)
  const prevBtn = document.getElementById('nav-prev')
  const nextBtn = document.getElementById('nav-next')

  if (prevBtn) {
    if (currentIndex > 0) {
      prevBtn.href = `#${slides[currentIndex - 1].id}`
      prevBtn.classList.remove('nav-disabled')
      prevBtn.classList.add('nav-link')
    } else {
      prevBtn.removeAttribute('href')
      prevBtn.classList.add('nav-disabled')
      prevBtn.classList.remove('nav-link')
    }
  }

  if (nextBtn) {
    if (currentIndex < slides.length - 1) {
      nextBtn.href = `#${slides[currentIndex + 1].id}`
      nextBtn.classList.remove('nav-disabled')
      nextBtn.classList.add('nav-link')
    } else {
      nextBtn.removeAttribute('href')
      nextBtn.classList.add('nav-disabled')
      nextBtn.classList.remove('nav-link')
    }
  }
}

// Update notes toggle visibility based on current slide
function updateNotesToggleVisibility() {
  const currentSlide = getCurrentSlide()
  const notesToggle = document.getElementById('notes-toggle')
  if (!notesToggle) return

  const hasNotes = currentSlide && currentSlide.querySelector('.speaker-notes')
  notesToggle.style.display = hasNotes ? '' : 'none'
}

// Re-highlight code and update UI when navigating (hash change)
window.addEventListener('hashchange', () => {
  updateSlideCounter()
  updateNavigation()
  updateNotesToggleVisibility()
  if (typeof Prism !== 'undefined') {
    // Small delay to ensure the slide is visible
    setTimeout(() => Prism.highlightAll(), 50)
  }
})

// Code tabs switching
function initCodeTabs() {
  document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabGroup = tab.closest('.code-tabs')
      const tabId = tab.dataset.tab

      // Update active tab button
      tabGroup.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')

      // Update active content
      tabGroup.querySelectorAll('.code-tab-content').forEach(c => c.classList.remove('active'))
      tabGroup.querySelector(`#tab-${tabId}`).classList.add('active')

      // Re-highlight code
      Prism.highlightAllUnder(tabGroup)
    })
  })
}
