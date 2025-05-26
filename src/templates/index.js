const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Template cache
const templateCache = new Map();

/**
 * Load and compile template
 * @param {string} templatePath - Path to template file
 * @returns {Function} Compiled template function
 */
const loadTemplate = (templatePath) => {
  if (templateCache.has(templatePath)) {
    return templateCache.get(templatePath);
  }
  
  const fullPath = path.join(__dirname, templatePath);
  const templateSource = fs.readFileSync(fullPath, 'utf8');
  const compiledTemplate = handlebars.compile(templateSource);
  
  templateCache.set(templatePath, compiledTemplate);
  return compiledTemplate;
};

/**
 * Render template with data
 * @param {string} templatePath - Path to template file
 * @param {Object} data - Template data
 * @returns {string} Rendered HTML
 */
const renderTemplate = (templatePath, data = {}) => {
  const template = loadTemplate(templatePath);
  return template(data);
};

// Email templates
const emailTemplates = {
  welcome: (data) => renderTemplate('email/welcome.html', data),
  passwordReset: (data) => renderTemplate('email/password-reset.html', data),
  projectSummary: (data) => renderTemplate('email/project-summary.html', data)
};

// Print templates
const printTemplates = {
  pulseReceipt: (data) => renderTemplate('print/pulse-receipt.html', data),
  dailySummary: (data) => renderTemplate('print/daily-summary.html', data)
};

// Clear template cache (useful for development)
const clearCache = () => {
  templateCache.clear();
};

module.exports = {
  emailTemplates,
  printTemplates,
  renderTemplate,
  clearCache
};