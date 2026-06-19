import { useState } from "react";
import { X, Plus, Book, Search, Trash2, ArrowLeft, Users, Mail } from "lucide-react";

const ReportSchedulerForm = () => {
  const reportNames = [
    "Sales Report",
    "Inventory Report",
    "Customer Analytics",
    "Financial Summary",
    "Performance Dashboard"
  ];

  // Address books with names and email lists
  const [addressBooks, setAddressBooks] = useState([
    { id: 1, name: "Team", emails: ["abc@gmail.com", "xyz@ymail.com"] },
    { id: 2, name: "Clients", emails: ["client1@company.com", "client2@corp.com"] },
    { id: 3, name: "Management", emails: ["manager@company.com"] }
  ]);

  const [recentSearches, setRecentSearches] = useState([
    "user@company.com",
    "test@example.com"
  ]);

  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [selectedAddressBook, setSelectedAddressBook] = useState(null);
  const [newEmailForBook, setNewEmailForBook] = useState("");
  const [newAddressBookName, setNewAddressBookName] = useState("");
  const [isCreatingNewBook, setIsCreatingNewBook] = useState(false);

  const [report, setReport] = useState({
    reportName: "",
    toInput: "",
    ccInput: "",
    to: [],
    cc: [],
    toSuggestions: [],
    ccSuggestions: [],
    mailTitle: "",
    mailBody: "",
    frequency: "",
    selectedDays: "",
    scheduleTime: ""
  });

  const [activeInputs, setActiveInputs] = useState({
    to: false,
    cc: false
  });

  // Get all unique emails from all address books
  const getAllEmails = (): string[] => {
    const allEmails = new Set<string>();
    addressBooks.forEach(book => {
      book.emails.forEach(email => allEmails.add(email));
    });
    return Array.from(allEmails);
  };

  // Get suggestions including both emails and address books
  const getSuggestions = (input: string): { type: string; value: string; id?: number }[] => {
    if (!input) return [];

    const suggestions: { type: string; value: string; id?: number }[] = [];
    const lowerInput = input.toLowerCase();

    // Add matching emails
    const allEmails = getAllEmails();
    allEmails.forEach(email => {
      if (email.toLowerCase().includes(lowerInput)) {
        suggestions.push({ type: 'email', value: email });
      }
    });

    // Add matching address books
    addressBooks.forEach(book => {
      if (book.name.toLowerCase().includes(lowerInput)) {
        suggestions.push({ type: 'addressBook', value: book.name, id: book.id });
      }
    });

    return suggestions;
  };

  // Handle email input change
  const handleEmailInputChange = (field, value) => {
    const suggestions = getSuggestions(value);
    setReport({
      ...report,
      [`${field}Input`]: value,
      [`${field}Suggestions`]: suggestions
    });
  };

  // Add email or address book to the field
  const handleAddItem = (field, item) => {
    if (item.type === 'email') {
      // Add single email
      if (!report[field].includes(item.value)) {
        setReport({
          ...report,
          [field]: [...report[field], item.value],
          [`${field}Input`]: "",
          [`${field}Suggestions`]: []
        });

        // Add to recent searches if not already there
        if (!recentSearches.includes(item.value) && !getAllEmails().includes(item.value)) {
          setRecentSearches([item.value, ...recentSearches]);
        }
      }
    } else if (item.type === 'addressBook') {
      // Add all emails from the address book
      const book = addressBooks.find(b => b.id === item.id);
      if (book) {
        const newEmails = book.emails.filter(email => !report[field].includes(email));
        setReport({
          ...report,
          [field]: [...report[field], ...newEmails],
          [`${field}Input`]: "",
          [`${field}Suggestions`]: []
        });
      }
    }
    setActiveInputs({ ...activeInputs, [field]: false });
  };

  // Remove email chip
  const handleRemoveEmailChip = (field, email) => {
    setReport({
      ...report,
      [field]: report[field].filter(e => e !== email)
    });
  };

  // Handle adding email to selected address book from recent searches
  const handleAddToAddressBook = (email) => {
    if (selectedAddressBook) {
      const updatedBooks = addressBooks.map(book => {
        if (book.id === selectedAddressBook) {
          if (!book.emails.includes(email)) {
            return { ...book, emails: [...book.emails, email] };
          }
        }
        return book;
      });
      setAddressBooks(updatedBooks);
    }
  };

  // Handle removing from recent searches
  const handleRemoveFromRecentSearches = (email) => {
    setRecentSearches(recentSearches.filter(e => e !== email));
  };

  // Handle adding email to selected address book
  const handleAddEmailToBook = () => {
    if (newEmailForBook && selectedAddressBook) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(newEmailForBook)) {
        const updatedBooks = addressBooks.map(book => {
          if (book.id === selectedAddressBook) {
            if (!book.emails.includes(newEmailForBook)) {
              return { ...book, emails: [...book.emails, newEmailForBook] };
            }
          }
          return book;
        });
        setAddressBooks(updatedBooks);
        setNewEmailForBook("");
      } else {
        alert("Please enter a valid email address");
      }
    }
  };

  // Handle creating new address book
  const handleCreateAddressBook = () => {
    if (newAddressBookName.trim()) {
      const newBook = {
        id: addressBooks.length + 1,
        name: newAddressBookName.trim(),
        emails: []
      };
      setAddressBooks([...addressBooks, newBook]);
      setSelectedAddressBook(newBook.id);
      setNewAddressBookName("");
      setIsCreatingNewBook(false);
    }
  };

  // Handle removing email from address book
  const handleRemoveFromBook = (bookId, email) => {
    const updatedBooks = addressBooks.map(book => {
      if (book.id === bookId) {
        return { ...book, emails: book.emails.filter(e => e !== email) };
      }
      return book;
    });
    setAddressBooks(updatedBooks);
  };

  const handleSubmit = () => {
    console.log("Report:", report);
    console.log("Address Books:", addressBooks);
    alert("Schedule saved! Check console for details.");
  };

  const selectedBook = addressBooks.find(book => book.id === selectedAddressBook);

  return (
    <div className="mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Create Schedule
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure your report schedule settings
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddressBookOpen(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all px-6 py-2.5 flex items-center gap-2"
        >
          <Book size={16} />
          Address Book
        </button>
      </div>

      {/* Report Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        {/* Report Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Name
          </label>
          <select
            value={report.reportName}
            onChange={(e) => setReport({ ...report, reportName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a report</option>
            {reportNames.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Mail Fields and Schedule */}
        <div className="grid grid-cols-12 gap-4">
          {/* To Field */}
          <div className="col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <div className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <div className="flex flex-wrap gap-2">
                  {report.to.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmailChip('to', email)}
                        className="hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <div className="relative flex-1 min-w-[120px]">
                    <div className="flex items-center">
                      <Search size={14} className="text-gray-400 mr-1" />
                      <input
                        type="text"
                        value={report.toInput}
                        onChange={(e) => handleEmailInputChange('to', e.target.value)}
                        onFocus={() => setActiveInputs({ ...activeInputs, to: true })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && report.toInput.trim()) {
                            e.preventDefault();
                            const email = report.toInput.trim();
                            if (!report.to.includes(email)) {
                              setReport({
                                ...report,
                                to: [...report.to, email],
                                toInput: "",
                                toSuggestions: []
                              });
                              // Add to recent searches if not already there
                              if (!recentSearches.includes(email) && !getAllEmails().includes(email)) {
                                setRecentSearches([email, ...recentSearches]);
                              }
                            } else {
                              setReport({
                                ...report,
                                toInput: "",
                                toSuggestions: []
                              });
                            }
                            setActiveInputs({ ...activeInputs, to: false });
                          }
                        }}
                        placeholder="Search email or address book..."
                        className="flex-1 outline-none text-sm"
                      />
                    </div>
                    {activeInputs.to && report.toSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {report.toSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAddItem('to', item)}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                          >
                            <span>{item.value}</span>
                            {item.type === 'addressBook' ? (
                              <Users size={14} className="text-purple-500" />
                            ) : (
                              <Mail size={14} className="text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CC Field */}
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CC
            </label>
            <div className="relative">
              <div className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <div className="flex flex-wrap gap-2">
                  {report.cc.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmailChip('cc', email)}
                        className="hover:text-green-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <div className="relative flex-1 min-w-[100px]">
                    <div className="flex items-center">
                      <Search size={14} className="text-gray-400 mr-1" />
                      <input
                        type="text"
                        value={report.ccInput}
                        onChange={(e) => handleEmailInputChange('cc', e.target.value)}
                        onFocus={() => setActiveInputs({ ...activeInputs, cc: true })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && report.ccInput.trim()) {
                            e.preventDefault();
                            const email = report.ccInput.trim();
                            if (!report.cc.includes(email)) {
                              setReport({
                                ...report,
                                cc: [...report.cc, email],
                                ccInput: "",
                                ccSuggestions: []
                              });
                              // Add to recent searches if not already there
                              if (!recentSearches.includes(email) && !getAllEmails().includes(email)) {
                                setRecentSearches([email, ...recentSearches]);
                              }
                            } else {
                              setReport({
                                ...report,
                                ccInput: "",
                                ccSuggestions: []
                              });
                            }
                            setActiveInputs({ ...activeInputs, cc: false });
                          }
                        }}
                        placeholder="Search email or address book..."
                        className="flex-1 outline-none text-sm"
                      />
                    </div>
                    {activeInputs.cc && report.ccSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {report.ccSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAddItem('cc', item)}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                          >
                            <span>{item.value}</span>
                            {item.type === 'addressBook' ? (
                              <Users size={14} className="text-purple-500" />
                            ) : (
                              <Mail size={14} className="text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={report.frequency}
              onChange={(e) => setReport({ ...report, frequency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Mail Title */}
          <div className="col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mail Title
            </label>
            <input
              type="text"
              value={report.mailTitle}
              onChange={(e) => setReport({ ...report, mailTitle: e.target.value })}
              placeholder="Enter mail subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Selected Days */}
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Days
            </label>
            <input
              type="text"
              value={report.selectedDays}
              onChange={(e) => setReport({ ...report, selectedDays: e.target.value })}
              placeholder="Monday, Thursday"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Schedule Time */}
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Time
            </label>
            <input
              type="time"
              value={report.scheduleTime}
              onChange={(e) => setReport({ ...report, scheduleTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Mail Body */}
          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mail Body
            </label>
            <textarea
              value={report.mailBody}
              onChange={(e) => setReport({ ...report, mailBody: e.target.value })}
              placeholder="Enter mail body..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
        >
          Save Schedule
        </button>
      </div>

      {/* Address Book Modal */}
      {isAddressBookOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Address Book Manager</h2>
              <button
                onClick={() => setIsAddressBookOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Address Book Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Address Book
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedAddressBook || ""}
                    onChange={(e) => setSelectedAddressBook(Number(e.target.value))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Choose an address book</option>
                    {addressBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.name} ({book.emails.length} emails)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsCreatingNewBook(true)}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    New
                  </button>
                </div>
              </div>

              {/* Create New Address Book */}
              {isCreatingNewBook && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Create New Address Book</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAddressBookName}
                      onChange={(e) => setNewAddressBookName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateAddressBook()}
                      placeholder="Enter address book name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={handleCreateAddressBook}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 transition-all"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingNewBook(false);
                        setNewAddressBookName("");
                      }}
                      className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Add Email to Selected Book */}
              {selectedAddressBook && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Email to "{selectedBook?.name}"
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEmailForBook}
                      onChange={(e) => setNewEmailForBook(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddEmailToBook()}
                      placeholder="Enter email address"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={handleAddEmailToBook}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2 transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h3>
                <div className="border border-gray-200 rounded-lg">
                  {recentSearches.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No recent searches
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {recentSearches.map((email, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                          <span className="text-sm text-gray-700">{email}</span>
                          <div className="flex items-center gap-2">
                            {selectedAddressBook && (
                              <button
                                onClick={() => handleAddToAddressBook(email)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Add to selected address book"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveFromRecentSearches(email)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Remove from recent searches"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Address Book Emails */}
              {selectedBook && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Emails in "{selectedBook.name}"
                  </h3>
                  <div className="border border-gray-200 rounded-lg">
                    {selectedBook.emails.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No emails in this address book yet
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {selectedBook.emails.map((email, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 hover:bg-gray-50"
                          >
                            <span className="text-sm text-gray-700">{email}</span>
                            <button
                              onClick={() => handleRemoveFromBook(selectedBook.id, email)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setIsAddressBookOpen(false)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSchedulerForm;